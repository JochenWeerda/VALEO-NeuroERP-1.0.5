import logging

# Konfiguriere den Logger
logger = logging.getLogger("valeo_neuroerp")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Exportiere den Logger
__all__ = ["logger"] 