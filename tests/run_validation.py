import asyncio
import logging
from pathlib import Path
import json
from datetime import datetime
from typing import Dict, Any
from validation_modules import (
    NetworkStressTest,
    RecoveryTest,
    PerformanceTest,
    IntegrationTest,
    ErrorInjectionTest,
    StabilityTest
)

# Logging-Konfiguration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('validation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('validation_runner')

class ValidationRunner:
    def __init__(self):
        self.results_dir = Path("validation_results")
        self.results_dir.mkdir(exist_ok=True)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    def save_results(self, test_name: str, results: Dict[str, Any]):
        """Speichert die Testergebnisse."""
        result_file = self.results_dir / f"{test_name}_{self.timestamp}.json"
        result_file.write_text(json.dumps(results, indent=2))
        logger.info(f"Ergebnisse gespeichert in: {result_file}")

    async def run_all_tests(self):
        """Führt alle Validierungstests parallel aus."""
        logger.info("Starte Validierungstests")

        # Erstelle Test-Instanzen
        network_test = NetworkStressTest()
        recovery_test = RecoveryTest()
        performance_test = PerformanceTest()
        integration_test = IntegrationTest()
        error_test = ErrorInjectionTest()
        stability_test = StabilityTest()

        # Führe Tests parallel aus
        results = await asyncio.gather(
            network_test.run_stress_test(),
            recovery_test.run_recovery_test(),
            performance_test.run_performance_test(),
            integration_test.run_integration_test(),
            error_test.run_error_injection_test(),
            stability_test.run_stability_test(),
            return_exceptions=True
        )

        # Speichere Ergebnisse
        test_names = [
            "network_stress",
            "recovery",
            "performance",
            "integration",
            "error_injection",
            "stability"
        ]

        for name, result in zip(test_names, results):
            if isinstance(result, Exception):
                logger.error(f"Fehler in {name}: {result}")
                self.save_results(name, {"error": str(result)})
            else:
                logger.info(f"Test {name} abgeschlossen")
                self.save_results(name, result)

        # Erstelle Zusammenfassungsbericht
        summary = {
            "timestamp": self.timestamp,
            "total_tests": len(test_names),
            "successful_tests": sum(1 for r in results if not isinstance(r, Exception)),
            "failed_tests": sum(1 for r in results if isinstance(r, Exception)),
            "test_results": {
                name: "success" if not isinstance(result, Exception) else "error"
                for name, result in zip(test_names, results)
            }
        }

        self.save_results("summary", summary)
        logger.info("Alle Validierungstests abgeschlossen")
        return summary

async def main():
    runner = ValidationRunner()
    await runner.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main()) 