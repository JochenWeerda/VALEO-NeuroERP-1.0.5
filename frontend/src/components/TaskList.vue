<template>
  <div class="task-list">
    <div class="task-list-header">
      <h2>{{ title }}</h2>
      <div class="task-list-actions">
        <button class="refresh-button" @click="fetchTasks" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Aktualisieren
        </button>
      </div>
    </div>
    
    <div class="task-list-filters" v-if="showFilters">
      <div class="filter-group">
        <label for="status-filter">Status:</label>
        <select id="status-filter" v-model="statusFilter">
          <option value="">Alle</option>
          <option value="PENDING,RECEIVED,STARTED,RUNNING">Aktiv</option>
          <option value="SUCCESS">Erfolgreich</option>
          <option value="FAILURE">Fehlgeschlagen</option>
          <option value="REVOKED">Abgebrochen</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="search-filter">Suche:</label>
        <input id="search-filter" type="text" v-model="searchFilter" placeholder="Task-Name oder ID" />
      </div>
    </div>
    
    <div class="task-list-content">
      <div v-if="loading" class="task-list-loading">
        <div class="loading-spinner"></div>
        <p>Tasks werden geladen...</p>
      </div>
      
      <div v-else-if="filteredTasks.length === 0" class="task-list-empty">
        <p>Keine Tasks gefunden</p>
      </div>
      
      <div v-else class="task-list-items">
        <TaskProgress
          v-for="task in filteredTasks"
          :key="task.task_id"
          :taskId="task.task_id"
          :status="task.status"
          :progress="task.progress"
          :name="task.name"
          :createdAt="task.created_at"
          :errorMessage="task.error_message"
          :showCancel="['PENDING', 'RECEIVED', 'STARTED', 'RUNNING'].includes(task.status)"
          @task-completed="onTaskCompleted"
          @task-cancelled="onTaskCancelled"
        />
      </div>
      
      <div v-if="filteredTasks.length > 0 && hasMoreTasks" class="task-list-load-more">
        <button class="load-more-button" @click="loadMoreTasks" :disabled="loadingMore">
          {{ loadingMore ? 'Lade weitere Tasks...' : 'Weitere Tasks laden' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import TaskProgress from './TaskProgress.vue';

export default {
  name: 'TaskList',
  components: {
    TaskProgress
  },
  props: {
    title: {
      type: String,
      default: 'Tasks'
    },
    apiEndpoint: {
      type: String,
      default: '/api/tasks'
    },
    autoRefresh: {
      type: Boolean,
      default: true
    },
    refreshInterval: {
      type: Number,
      default: 10000 // 10 Sekunden
    },
    showFilters: {
      type: Boolean,
      default: true
    },
    maxItems: {
      type: Number,
      default: 10
    }
  },
  
  data() {
    return {
      tasks: [],
      loading: true,
      loadingMore: false,
      statusFilter: '',
      searchFilter: '',
      page: 1,
      hasMoreTasks: false,
      refreshTimer: null
    };
  },
  
  computed: {
    filteredTasks() {
      let result = this.tasks;
      
      // Nach Status filtern
      if (this.statusFilter) {
        const statuses = this.statusFilter.split(',');
        result = result.filter(task => statuses.includes(task.status));
      }
      
      // Nach Name oder ID filtern
      if (this.searchFilter) {
        const searchLower = this.searchFilter.toLowerCase();
        result = result.filter(task => 
          (task.name && task.name.toLowerCase().includes(searchLower)) || 
          task.task_id.toLowerCase().includes(searchLower)
        );
      }
      
      return result;
    }
  },
  
  methods: {
    async fetchTasks(resetPage = true) {
      if (resetPage) {
        this.page = 1;
        this.loading = true;
      } else {
        this.loadingMore = true;
      }
      
      try {
        const response = await fetch(`${this.apiEndpoint}?page=${this.page}&limit=${this.maxItems}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (resetPage) {
            this.tasks = data.tasks || [];
          } else {
            this.tasks = [...this.tasks, ...(data.tasks || [])];
          }
          
          this.hasMoreTasks = (data.tasks || []).length >= this.maxItems;
        } else {
          console.error('Fehler beim Laden der Tasks:', response.status);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Tasks:', error);
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },
    
    loadMoreTasks() {
      this.page += 1;
      this.fetchTasks(false);
    },
    
    startAutoRefresh() {
      if (this.autoRefresh && !this.refreshTimer) {
        this.refreshTimer = setInterval(() => {
          this.fetchTasks();
        }, this.refreshInterval);
      }
    },
    
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    
    onTaskCompleted(event) {
      this.$emit('task-completed', event);
      this.fetchTasks();
    },
    
    onTaskCancelled(event) {
      this.$emit('task-cancelled', event);
      this.fetchTasks();
    }
  },
  
  watch: {
    statusFilter() {
      this.fetchTasks();
    },
    
    searchFilter() {
      // Implementiere Debouncing für die Suche
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      this.searchTimeout = setTimeout(() => {
        this.fetchTasks();
      }, 300);
    },
    
    autoRefresh(newVal) {
      if (newVal) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    }
  },
  
  mounted() {
    this.fetchTasks();
    
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },
  
  beforeDestroy() {
    this.stopAutoRefresh();
  }
};
</script>

<style scoped>
.task-list {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
}

.task-list-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
}

.refresh-button {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #e0e0e0;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-list-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-group select,
.filter-group input {
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.task-list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.task-list-empty {
  text-align: center;
  padding: 32px 0;
  color: #666;
  font-style: italic;
}

.task-list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-list-load-more {
  text-align: center;
  margin-top: 16px;
}

.load-more-button {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-button:hover {
  background-color: #e0e0e0;
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 