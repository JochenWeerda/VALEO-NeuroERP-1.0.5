import pytest

def test_basic_functionality():
    """Einfacher Test für die grundlegende Funktionalität"""
    assert 1 + 1 == 2
    assert "Hello" in "Hello World"
    assert len([1, 2, 3]) == 3

def test_string_operations():
    """Test für String-Operationen"""
    text = "VALEO NeuroERP"
    assert "VALEO" in text
    assert text.upper() == "VALEO NEUROERP"
    assert text.lower() == "valeo neuroerp"

def test_list_operations():
    """Test für Listen-Operationen"""
    numbers = [1, 2, 3, 4, 5]
    assert sum(numbers) == 15
    assert max(numbers) == 5
    assert min(numbers) == 1
    assert len(numbers) == 5

def test_dictionary_operations():
    """Test für Dictionary-Operationen"""
    config = {
        "name": "VALEO NeuroERP",
        "version": "2.0",
        "status": "active"
    }
    assert config["name"] == "VALEO NeuroERP"
    assert "version" in config
    assert len(config) == 3

@pytest.mark.parametrize("input_value,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
    (10, 20)
])
def test_parameterized_test(input_value, expected):
    """Parametrisierter Test"""
    assert input_value * 2 == expected

class TestClass:
    """Test-Klasse für objektorientierte Tests"""
    
    def setup_method(self):
        """Setup für jeden Test"""
        self.test_data = [1, 2, 3, 4, 5]
    
    def test_setup_works(self):
        """Test ob Setup funktioniert"""
        assert len(self.test_data) == 5
        assert sum(self.test_data) == 15
    
    def test_data_manipulation(self):
        """Test für Datenmanipulation"""
        self.test_data.append(6)
        assert len(self.test_data) == 6
        assert self.test_data[-1] == 6 