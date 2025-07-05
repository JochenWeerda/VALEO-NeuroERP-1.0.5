<template>
  <div class="task-progress" :class="statusClass">
    <div class="task-header">
      <h3 class="task-name">{{ name }}</h3>
      <span class="task-status">{{ statusText }}</span>
    </div>
    
    <div class="progress-container" v-if="showProgress">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      <span class="progress-text">{{ progress }}%</span>
    </div>
    
    <div class="task-details">
      <div class="task-info">
        <span class="task-id">ID: {{ taskId }}</span>
        <span class="task-created">{{ formattedCreatedAt }}</span>
      </div>
      
      <div class="task-error" v-if="errorMessage">
        <p class="error-message">{{ errorMessage }}</p>
      </div>
      
      <div class="task-actions" v-if="showCancel">
        <button class="cancel-button" @click="cancelTask">Abbrechen</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskProgress',
  props: {
    taskId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'PENDING'
    },
    progress: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      default: 'Task'
    },
    createdAt: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    showCancel: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      pollingInterval: null,
      currentStatus: this.status,
      currentProgress: this.progress
    };
  },
  
  computed: {
    statusClass() {
      return {
        'status-pending': this.currentStatus === 'PENDING' || this.currentStatus === 'RECEIVED',
        'status-running': this.currentStatus === 'STARTED' || this.currentStatus === 'RUNNING',
        'status-success': this.currentStatus === 'SUCCESS',
        'status-failure': this.currentStatus === 'FAILURE',
        'status-revoked': this.currentStatus === 'REVOKED'
      };
    },
    
    statusText() {
      switch (this.currentStatus) {
        case 'SUCCESS':
          return 'Abgeschlossen';
        case 'FAILURE':
          return 'Fehlgeschlagen';
        case 'REVOKED':
          return 'Abgebrochen';
        case 'RUNNING':
          return 'Wird ausgeführt';
        case 'STARTED':
          return 'Gestartet';
        case 'RECEIVED':
          return 'Empfangen';
        case 'PENDING':
          return 'Ausstehend';
        default:
          return this.currentStatus;
      }
    },
    
    showProgress() {
      return ['PENDING', 'RECEIVED', 'STARTED', 'RUNNING'].includes(this.currentStatus);
    },
    
    formattedCreatedAt() {
      if (!this.createdAt) return '';
      
      try {
        const date = new Date(this.createdAt);
        return date.toLocaleString();
      } catch (e) {
        return this.createdAt;
      }
    }
  },
  
  methods: {
    async fetchTaskStatus() {
      try {
        const response = await fetch(`/api/tasks/${this.taskId}/status`);
        if (response.ok) {
          const data = await response.json();
          this.currentStatus = data.status;
          this.currentProgress = data.progress;
          
          // Wenn der Task abgeschlossen ist, beende das Polling
          if (['SUCCESS', 'FAILURE', 'REVOKED'].includes(this.currentStatus)) {
            this.stopPolling();
            this.$emit('task-completed', {
              taskId: this.taskId,
              status: this.currentStatus,
              result: data.result
            });
          }
        }
      } catch (error) {
        console.error('Fehler beim Abrufen des Task-Status:', error);
      }
    },
    
    async cancelTask() {
      try {
        const response = await fetch(`/api/tasks/${this.taskId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          }
        });
        
        if (response.ok) {
          this.currentStatus = 'REVOKED';
          this.stopPolling();
          this.$emit('task-cancelled', { taskId: this.taskId });
        } else {
          const data = await response.json();
          console.error('Fehler beim Abbrechen des Tasks:', data.error);
        }
      } catch (error) {
        console.error('Fehler beim Abbrechen des Tasks:', error);
      }
    },
    
    startPolling() {
      // Starte das Polling nur, wenn der Task noch nicht abgeschlossen ist
      if (!['SUCCESS', 'FAILURE', 'REVOKED'].includes(this.currentStatus)) {
        this.pollingInterval = setInterval(this.fetchTaskStatus, 2000);
      }
    },
    
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },
    
    getCsrfToken() {
      // CSRF-Token aus den Cookies extrahieren
      const name = 'csrftoken=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
      
      return '';
    }
  },
  
  mounted() {
    this.startPolling();
  },
  
  beforeDestroy() {
    this.stopPolling();
  }
};
</script>

<style scoped>
.task-progress {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.task-status {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #e0e0e0;
}

.progress-container {
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin: 12px 0;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.task-details {
  font-size: 0.85rem;
  color: #666;
}

.task-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  padding: 8px;
  margin: 8px 0;
}

.error-message {
  margin: 0;
  color: #d32f2f;
}

.task-actions {
  margin-top: 12px;
  text-align: right;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.cancel-button:hover {
  background-color: #d32f2f;
}

/* Status-spezifische Stile */
.status-pending .task-status {
  background-color: #e0e0e0;
  color: #616161;
}

.status-running .task-status {
  background-color: #bbdefb;
  color: #1976d2;
}

.status-success .task-status {
  background-color: #c8e6c9;
  color: #388e3c;
}

.status-failure .task-status {
  background-color: #ffcdd2;
  color: #d32f2f;
}

.status-revoked .task-status {
  background-color: #ffe0b2;
  color: #f57c00;
}

.status-success {
  border-left: 4px solid #4caf50;
}

.status-failure {
  border-left: 4px solid #f44336;
}

.status-running {
  border-left: 4px solid #2196f3;
}

.status-pending {
  border-left: 4px solid #9e9e9e;
}

.status-revoked {
  border-left: 4px solid #ff9800;
}
</style> 