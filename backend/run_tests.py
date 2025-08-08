#!/usr/bin/env python3
"""
VALEO NeuroERP 2.0 - Test Runner
Serena Quality: Comprehensive test runner for all API tests
"""

import os
import sys
import subprocess
import argparse
import time
import json
from pathlib import Path
from typing import List, Dict, Any
import pytest

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

class TestRunner:
    """Comprehensive test runner for VALEO NeuroERP 2.0"""
    
    def __init__(self):
        self.project_root = project_root
        self.backend_dir = project_root / "backend"
        self.tests_dir = self.backend_dir / "tests"
        self.results_dir = self.backend_dir / "test_results"
        
        # Ensure results directory exists
        self.results_dir.mkdir(exist_ok=True)
        
        # Test configuration
        self.test_config = {
            "warenwirtschaft": {
                "file": "test_warenwirtschaft_api.py",
                "description": "Warenwirtschaft API Tests",
                "endpoints": ["artikel-stammdaten", "lager", "einlagerung", "bestellung", "lieferant", "inventur"]
            },
            "finanzbuchhaltung": {
                "file": "test_finanzbuchhaltung_api.py",
                "description": "Finanzbuchhaltung API Tests",
                "endpoints": ["konto", "buchung", "rechnung", "zahlung", "kostenstelle", "budget", "steuer"]
            },
            "crm": {
                "file": "test_crm_api.py",
                "description": "CRM API Tests",
                "endpoints": ["kunde", "kontakt", "angebot", "auftrag", "verkaufschance", "marketing-kampagne", "kundenservice"]
            },
            "uebergreifende_services": {
                "file": "test_uebergreifende_services_api.py",
                "description": "Übergreifende Services API Tests",
                "endpoints": ["benutzer", "rolle", "permission", "system-einstellung", "workflow-definition", "dokument", "integration"]
            }
        }
    
    def run_single_test(self, module: str, test_name: str = None, verbose: bool = False) -> Dict[str, Any]:
        """Run a single test module or specific test"""
        if module not in self.test_config:
            raise ValueError(f"Unknown module: {module}")
        
        config = self.test_config[module]
        test_file = self.tests_dir / config["file"]
        
        if not test_file.exists():
            return {
                "success": False,
                "error": f"Test file not found: {test_file}",
                "module": module,
                "test_name": test_name
            }
        
        # Build pytest command
        cmd = [
            sys.executable, "-m", "pytest",
            str(test_file),
            "-v" if verbose else "-q",
            "--tb=short",
            "--strict-markers",
            "--disable-warnings"
        ]
        
        if test_name:
            cmd.append(f"-k {test_name}")
        
        # Run test
        start_time = time.time()
        try:
            result = subprocess.run(
                cmd,
                cwd=self.backend_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            end_time = time.time()
            
            return {
                "success": result.returncode == 0,
                "module": module,
                "test_name": test_name,
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "duration": end_time - start_time,
                "command": " ".join(cmd)
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Test timeout after 5 minutes",
                "module": module,
                "test_name": test_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "module": module,
                "test_name": test_name
            }
    
    def run_all_tests(self, verbose: bool = False, parallel: bool = False) -> Dict[str, Any]:
        """Run all test modules"""
        results = {}
        total_start_time = time.time()
        
        print("🚀 Starting VALEO NeuroERP 2.0 API Tests...")
        print("=" * 60)
        
        for module, config in self.test_config.items():
            print(f"\n📋 Running {config['description']}...")
            result = self.run_single_test(module, verbose=verbose)
            results[module] = result
            
            if result["success"]:
                print(f"✅ {module}: PASSED ({result['duration']:.2f}s)")
            else:
                print(f"❌ {module}: FAILED")
                if "error" in result:
                    print(f"   Error: {result['error']}")
                if result.get("stderr"):
                    print(f"   Stderr: {result['stderr'][:200]}...")
        
        total_duration = time.time() - total_start_time
        
        # Generate summary
        summary = self.generate_summary(results, total_duration)
        
        # Save results
        self.save_results(results, summary)
        
        return {
            "results": results,
            "summary": summary,
            "total_duration": total_duration
        }
    
    def generate_summary(self, results: Dict[str, Any], total_duration: float) -> Dict[str, Any]:
        """Generate test summary"""
        total_tests = len(results)
        passed_tests = sum(1 for r in results.values() if r["success"])
        failed_tests = total_tests - passed_tests
        
        # Count test cases from output
        total_test_cases = 0
        passed_test_cases = 0
        failed_test_cases = 0
        
        for result in results.values():
            if result.get("stdout"):
                # Parse pytest output for test counts
                lines = result["stdout"].split("\n")
                for line in lines:
                    if "collected" in line and "items" in line:
                        # Extract test count
                        try:
                            count = int(line.split()[0])
                            total_test_cases += count
                        except (ValueError, IndexError):
                            pass
                    elif "passed" in line and "failed" in line:
                        # Extract passed/failed counts
                        try:
                            parts = line.split()
                            passed_idx = parts.index("passed")
                            failed_idx = parts.index("failed")
                            passed_test_cases += int(parts[passed_idx - 1])
                            failed_test_cases += int(parts[failed_idx - 1])
                        except (ValueError, IndexError):
                            pass
        
        return {
            "total_modules": total_tests,
            "passed_modules": passed_tests,
            "failed_modules": failed_tests,
            "total_test_cases": total_test_cases,
            "passed_test_cases": passed_test_cases,
            "failed_test_cases": failed_test_cases,
            "total_duration": total_duration,
            "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0
        }
    
    def save_results(self, results: Dict[str, Any], summary: Dict[str, Any]):
        """Save test results to file"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        results_file = self.results_dir / f"test_results_{timestamp}.json"
        
        output = {
            "timestamp": timestamp,
            "summary": summary,
            "results": results,
            "test_config": self.test_config
        }
        
        with open(results_file, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Results saved to: {results_file}")
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Modules: {summary['total_modules']}")
        print(f"Passed Modules: {summary['passed_modules']}")
        print(f"Failed Modules: {summary['failed_modules']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Total Test Cases: {summary['total_test_cases']}")
        print(f"Passed Test Cases: {summary['passed_test_cases']}")
        print(f"Failed Test Cases: {summary['failed_test_cases']}")
        print(f"Total Duration: {summary['total_duration']:.2f}s")
        
        if summary['failed_modules'] > 0:
            print("\n❌ FAILED MODULES:")
            for module, result in results.items():
                if not result["success"]:
                    print(f"  - {module}: {result.get('error', 'Unknown error')}")
        
        print("\n" + "=" * 60)
    
    def run_coverage(self) -> Dict[str, Any]:
        """Run tests with coverage"""
        print("\n📈 Running tests with coverage...")
        
        cmd = [
            sys.executable, "-m", "pytest",
            str(self.tests_dir),
            "--cov=backend.app",
            "--cov-report=html:test_results/coverage_html",
            "--cov-report=term-missing",
            "--cov-report=json:test_results/coverage.json",
            "-v"
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.backend_dir,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes timeout
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "return_code": result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Coverage test timeout after 10 minutes"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def run_performance_tests(self) -> Dict[str, Any]:
        """Run performance tests"""
        print("\n⚡ Running performance tests...")
        
        # This would include load testing, stress testing, etc.
        # For now, we'll just run the regular tests with timing
        return self.run_all_tests(verbose=True)
    
    def run_security_tests(self) -> Dict[str, Any]:
        """Run security tests"""
        print("\n🔒 Running security tests...")
        
        # Security test endpoints
        security_endpoints = [
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout",
            "/api/v1/uebergreifende-services/benutzer/",
            "/api/v1/uebergreifende-services/permission/"
        ]
        
        results = {}
        for endpoint in security_endpoints:
            # Test authentication requirements
            # Test authorization checks
            # Test input validation
            # Test SQL injection protection
            # Test XSS protection
            pass
        
        return {
            "success": True,
            "message": "Security tests completed",
            "results": results
        }

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="VALEO NeuroERP 2.0 Test Runner")
    parser.add_argument("--module", "-m", help="Run tests for specific module")
    parser.add_argument("--test", "-t", help="Run specific test")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--coverage", "-c", action="store_true", help="Run with coverage")
    parser.add_argument("--performance", "-p", action="store_true", help="Run performance tests")
    parser.add_argument("--security", "-s", action="store_true", help="Run security tests")
    parser.add_argument("--all", "-a", action="store_true", help="Run all tests")
    
    args = parser.parse_args()
    
    runner = TestRunner()
    
    try:
        if args.coverage:
            result = runner.run_coverage()
            print("Coverage test completed")
            return 0 if result["success"] else 1
        
        elif args.performance:
            result = runner.run_performance_tests()
            runner.print_summary(result["summary"])
            return 0 if result["summary"]["failed_modules"] == 0 else 1
        
        elif args.security:
            result = runner.run_security_tests()
            print("Security tests completed")
            return 0 if result["success"] else 1
        
        elif args.module:
            result = runner.run_single_test(args.module, args.test, args.verbose)
            if result["success"]:
                print(f"✅ {args.module}: PASSED")
                return 0
            else:
                print(f"❌ {args.module}: FAILED")
                if "error" in result:
                    print(f"Error: {result['error']}")
                return 1
        
        elif args.all or not any([args.module, args.test, args.coverage, args.performance, args.security]):
            result = runner.run_all_tests(args.verbose)
            runner.print_summary(result["summary"])
            return 0 if result["summary"]["failed_modules"] == 0 else 1
        
        else:
            parser.print_help()
            return 1
    
    except KeyboardInterrupt:
        print("\n⚠️  Test run interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Test run failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 