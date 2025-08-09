# -*- coding: utf-8 -*-
from __future__ import annotations

import os
import time
import queue
import json
import threading
from dataclasses import dataclass
from typing import Optional, List

# Audio
try:
    import sounddevice as sd
    import numpy as np
except Exception:
    sd = None
    np = None

# VAD
try:
    import webrtcvad  # type: ignore
except Exception:
    webrtcvad = None  # type: ignore

# STT
try:
    from faster_whisper import WhisperModel  # type: ignore
except Exception:
    WhisperModel = None  # type: ignore

# TTS (lokal)
try:
    import pyttsx3  # type: ignore
except Exception:
    pyttsx3 = None  # type: ignore

import requests


@dataclass
class VoiceConfig:
    llm_base_url: str = os.getenv("LLM_BASE_URL", "http://localhost:11434")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-oss-20b-small")
    stt_model: str = os.getenv("VOICE_STT_MODEL", "small")
    samplerate: int = int(os.getenv("VOICE_SR", "16000"))
    vad_aggr: int = int(os.getenv("VOICE_VAD", "2"))  # 0-3
    silence_ms: int = int(os.getenv("VOICE_SILENCE_MS", "800"))
    max_utt_ms: int = int(os.getenv("VOICE_MAX_UTT_MS", "15000"))
    language: str = os.getenv("VOICE_LANG", "de")
    device_in: Optional[str] = os.getenv("VOICE_MIC_DEVICE")
    device_out: Optional[str] = os.getenv("VOICE_SPK_DEVICE")


class LocalTTS:
    def __init__(self) -> None:
        self.engine = None
        if pyttsx3 is not None:
            try:
                self.engine = pyttsx3.init()
                rate = self.engine.getProperty('rate')
                self.engine.setProperty('rate', int(rate * 0.95))
                vol = self.engine.getProperty('volume')
                self.engine.setProperty('volume', vol)
            except Exception:
                self.engine = None

    def speak(self, text: str) -> None:
        if not text:
            return
        if self.engine is not None:
            try:
                self.engine.say(text)
                self.engine.runAndWait()
                return
            except Exception:
                pass
        # Fallback: Konsole
        print(f"[TTS] {text}")


class LocalSTT:
    def __init__(self, cfg: VoiceConfig) -> None:
        self.model = None
        if WhisperModel is not None:
            try:
                # compute_type int8 für Ressourcenersparnis
                self.model = WhisperModel(cfg.stt_model, compute_type="int8")
            except Exception:
                self.model = None

    def transcribe(self, audio: np.ndarray, sr: int, language: str = "de") -> str:
        if self.model is None or np is None:
            # Fallback auf leere Transkription
            return ""
        segments, _ = self.model.transcribe(audio, language=language)
        text_parts: List[str] = []
        for seg in segments:
            text_parts.append(seg.text.strip())
        return " ".join(t for t in text_parts if t)


class OllamaChat:
    def __init__(self, base_url: str, model: str) -> None:
        self.base_url = base_url.rstrip('/')
        self.model = model

    def chat(self, user_text: str) -> str:
        try:
            url = f"{self.base_url}/api/chat"
            headers = {"Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "Du bist ein hilfreicher deutscher Assistent."},
                    {"role": "user", "content": user_text},
                ],
                "stream": False,
                "options": {"temperature": 0.3, "num_ctx": 1536, "num_predict": 384}
            }
            resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=120)
            resp.raise_for_status()
            data = resp.json()
            content = data.get("message", {}).get("content", "")
            return content or ""
        except Exception as e:
            return f"[LLM-Fehler] {e}"


class Recorder:
    def __init__(self, cfg: VoiceConfig) -> None:
        self.cfg = cfg
        self._q: queue.Queue = queue.Queue()
        self._stream = None
        self._stop = threading.Event()
        self._vad = webrtcvad.Vad(cfg.vad_aggr) if webrtcvad is not None else None

    def _callback(self, indata, frames, time_info, status):  # type: ignore
        if status:
            # print(status)
            pass
        self._q.put(indata.copy())
        return None

    def start(self) -> None:
        if sd is None or np is None:
            raise RuntimeError("Audio-Bibliotheken nicht verfügbar (sounddevice/numpy)")
        self._stop.clear()
        self._stream = sd.InputStream(
            samplerate=self.cfg.samplerate,
            channels=1,
            dtype='int16',
            callback=self._callback,
            device=self.cfg.device_in
        )
        self._stream.start()

    def stop(self) -> None:
        self._stop.set()
        if self._stream is not None:
            self._stream.stop()
            self._stream.close()
            self._stream = None

    def listen_once(self) -> Optional[np.ndarray]:
        """Aufnehmen bis Stille (VAD) oder Timeout. Rückgabe: int16 numpy array."""
        if sd is None or np is None:
            return None
        sr = self.cfg.samplerate
        frame_ms = 30
        frame_len = int(sr * frame_ms / 1000)
        silence_needed = int(self.cfg.silence_ms / frame_ms)
        max_frames = int(self.cfg.max_utt_ms / frame_ms)

        voiced_started = False
        silence_count = 0
        frames: List[np.ndarray] = []

        start_t = time.time()
        while True:
            try:
                chunk = self._q.get(timeout=2.0)
            except queue.Empty:
                if not frames:
                    return None
                else:
                    break
            # chunk ist int16 shape (n,1)
            data = chunk.reshape(-1)
            # Aufteilen in 30ms Frames
            for i in range(0, len(data), frame_len):
                f = data[i:i+frame_len]
                if len(f) < frame_len:
                    continue
                is_speech = True
                if self._vad is not None:
                    try:
                        is_speech = self._vad.is_speech(f.tobytes(), sr)
                    except Exception:
                        is_speech = True
                frames.append(f.copy())
                if is_speech:
                    voiced_started = True
                    silence_count = 0
                else:
                    if voiced_started:
                        silence_count += 1
                if voiced_started and silence_count >= silence_needed:
                    # Ende der Äußerung
                    audio = np.concatenate(frames, axis=0)
                    return audio
                if len(frames) >= max_frames:
                    audio = np.concatenate(frames, axis=0)
                    return audio
            # Sicherheit gegen sehr lange Blockaden
            if time.time() - start_t > (self.cfg.max_utt_ms / 1000.0 + 5):
                break
        if frames:
            return np.concatenate(frames, axis=0)
        return None


def main() -> None:
    cfg = VoiceConfig()
    print("[VOICE] Lokaler Sprachassistent – Enter zum Starten, Strg+C zum Beenden.")
    print("[VOICE] LLM:", cfg.llm_model, "@", cfg.llm_base_url)
    print("[VOICE] STT:", cfg.stt_model, "Samplerate:", cfg.samplerate)

    tts = LocalTTS()
    stt = LocalSTT(cfg)
    rec = Recorder(cfg)

    if sd is None or np is None:
        print("[WARN] sounddevice/numpy nicht verfügbar – Textmodus aktiv.")
        chat = OllamaChat(cfg.llm_base_url, cfg.llm_model)
        while True:
            try:
                text = input("[Du] > ").strip()
                if not text:
                    continue
                resp = chat.chat(text)
                print(f"[Assistent] {resp}")
                tts.speak(resp)
            except KeyboardInterrupt:
                break
        return

    chat = OllamaChat(cfg.llm_base_url, cfg.llm_model)

    try:
        rec.start()
        while True:
            input("[VOICE] Drücke Enter und spreche (VAD stoppt bei Stille)...")
            print("[VOICE] Aufnahme…")
            audio = rec.listen_once()
            if audio is None or audio.size == 0:
                print("[VOICE] Nichts aufgenommen.")
                continue
            # int16 -> float32 normalisiert für STT
            audio_f32 = (audio.astype('float32') / 32768.0)
            print("[VOICE] Transkribiere…")
            text = stt.transcribe(audio_f32, cfg.samplerate, language=cfg.language)
            print(f"[Du] {text}")
            if not text:
                continue
            print("[VOICE] Frage LLM…")
            resp = chat.chat(text)
            print(f"[Assistent] {resp}")
            tts.speak(resp)
    except KeyboardInterrupt:
        pass
    finally:
        rec.stop()


if __name__ == "__main__":
    main()