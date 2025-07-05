class ServiceException(Exception):
    """Base exception for service layer errors"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)
        
class ValidationException(ServiceException):
    """Exception for validation errors"""
    pass
    
class AuthenticationException(ServiceException):
    """Exception for authentication errors"""
    pass
    
class AuthorizationException(ServiceException):
    """Exception for authorization errors"""
    pass
    
class NotFoundException(ServiceException):
    """Exception for not found errors"""
    pass
    
class DuplicateException(ServiceException):
    """Exception for duplicate entry errors"""
    pass
    
class DatabaseException(ServiceException):
    """Exception for database errors"""
    pass
    
class CacheException(ServiceException):
    """Exception for cache errors"""
    pass
    
class ConfigurationException(ServiceException):
    """Exception for configuration errors"""
    pass
    
class IntegrationException(ServiceException):
    """Exception for external integration errors"""
    pass 