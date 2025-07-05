from django.urls import path, include
from backend.services.frontend_integration import task_status_api, active_tasks_api, cancel_task_api

# Task-Queue-API-Endpunkte
task_queue_urls = [
    path('tasks/', active_tasks_api, name='active_tasks_api'),
    path('tasks/<str:task_id>/status/', task_status_api, name='task_status_api'),
    path('tasks/<str:task_id>/cancel/', cancel_task_api, name='cancel_task_api'),
]

urlpatterns = [
    path('api/', include(task_queue_urls)),
] 