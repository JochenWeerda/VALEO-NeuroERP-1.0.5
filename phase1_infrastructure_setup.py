#!/usr/bin/env python3
"""
VALEO-NeuroERP Phase 1: Foundation & Infrastructure Setup
Basierend auf dem VAN Navigation Report
"""
import os
import json
import subprocess
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List
import yaml

class Phase1InfrastructureSetup:
    """Phase 1: Foundation & Infrastructure Setup"""
    
    def __init__(self):
        self.phase_name = "Foundation & Infrastructure"
        self.duration = "8-12 Wochen"
        self.priority = "critical"
        self.start_date = datetime.now()
        self.target_date = self.start_date + timedelta(weeks=10)
        
        # Infrastruktur-Komponenten
        self.components = {
            "cloud_infrastructure": {
                "name": "Cloud-Infrastruktur Setup",
                "status": "pending",
                "priority": "critical",
                "dependencies": [],
                "tools": ["Docker", "Kubernetes", "Terraform", "AWS/Azure/GCP"]
            },
            "ci_cd_pipeline": {
                "name": "CI/CD Pipeline",
                "status": "pending", 
                "priority": "critical",
                "dependencies": ["cloud_infrastructure"],
                "tools": ["GitHub Actions", "Jenkins", "ArgoCD"]
            },
            "monitoring_logging": {
                "name": "Monitoring & Logging",
                "status": "pending",
                "priority": "high",
                "dependencies": ["cloud_infrastructure"],
                "tools": ["Prometheus", "Grafana", "ELK Stack", "Jaeger"]
            },
            "security_framework": {
                "name": "Security Framework",
                "status": "pending",
                "priority": "critical",
                "dependencies": ["cloud_infrastructure"],
                "tools": ["Vault", "Cert-Manager", "Network Policies", "RBAC"]
            },
            "database_design": {
                "name": "Datenbank-Design",
                "status": "pending",
                "priority": "high",
                "dependencies": ["cloud_infrastructure"],
                "tools": ["PostgreSQL", "Redis", "MongoDB", "Elasticsearch"]
            }
        }
        
        # Erfolgskriterien
        self.success_criteria = [
            "Infrastruktur deployt",
            "CI/CD funktioniert", 
            "Monitoring aktiv",
            "Security-Audit bestanden"
        ]
    
    def create_docker_compose(self) -> str:
        """Erstellt Docker Compose für lokale Entwicklung"""
        docker_compose = {
            "version": "3.8",
            "services": {
                "postgres": {
                    "image": "postgres:15",
                    "environment": {
                        "POSTGRES_DB": "valeo_neuroerp",
                        "POSTGRES_USER": "valeo_user",
                        "POSTGRES_PASSWORD": "valeo_password"
                    },
                    "ports": ["5432:5432"],
                    "volumes": ["./data/postgres:/var/lib/postgresql/data"]
                },
                "redis": {
                    "image": "redis:7-alpine",
                    "ports": ["6379:6379"],
                    "volumes": ["./data/redis:/data"]
                },
                "rabbitmq": {
                    "image": "rabbitmq:3-management",
                    "environment": {
                        "RABBITMQ_DEFAULT_USER": "valeo_user",
                        "RABBITMQ_DEFAULT_PASS": "valeo_password"
                    },
                    "ports": ["5672:5672", "15672:15672"]
                },
                "elasticsearch": {
                    "image": "elasticsearch:8.11.0",
                    "environment": {
                        "discovery.type": "single-node",
                        "xpack.security.enabled": "false"
                    },
                    "ports": ["9200:9200"],
                    "volumes": ["./data/elasticsearch:/usr/share/elasticsearch/data"]
                },
                "kibana": {
                    "image": "kibana:8.11.0",
                    "ports": ["5601:5601"],
                    "depends_on": ["elasticsearch"]
                },
                "prometheus": {
                    "image": "prom/prometheus:latest",
                    "ports": ["9090:9090"],
                    "volumes": [
                        "./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml",
                        "./data/prometheus:/prometheus"
                    ]
                },
                "grafana": {
                    "image": "grafana/grafana:latest",
                    "ports": ["3000:3000"],
                    "environment": {
                        "GF_SECURITY_ADMIN_PASSWORD": "valeo_admin"
                    },
                    "volumes": ["./data/grafana:/var/lib/grafana"]
                }
            },
            "volumes": {
                "postgres_data": None,
                "redis_data": None,
                "elasticsearch_data": None,
                "prometheus_data": None,
                "grafana_data": None
            }
        }
        
        return yaml.dump(docker_compose, default_flow_style=False)
    
    def create_kubernetes_manifests(self) -> Dict[str, str]:
        """Erstellt Kubernetes Manifests für Production"""
        manifests = {}
        
        # Namespace
        manifests["namespace.yaml"] = """
apiVersion: v1
kind: Namespace
metadata:
  name: valeo-neuroerp
  labels:
    name: valeo-neuroerp
"""
        
        # PostgreSQL StatefulSet
        manifests["postgres-statefulset.yaml"] = """
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: valeo-neuroerp
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: "valeo_neuroerp"
        - name: POSTGRES_USER
          value: "valeo_user"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
"""
        
        # Redis Deployment
        manifests["redis-deployment.yaml"] = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: valeo-neuroerp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
"""
        
        return manifests
    
    def create_github_actions_workflow(self) -> str:
        """Erstellt GitHub Actions CI/CD Workflow"""
        workflow = {
            "name": "VALEO-NeuroERP CI/CD Pipeline",
            "on": {
                "push": {"branches": ["main", "develop"]},
                "pull_request": {"branches": ["main"]}
            },
            "jobs": {
                "test": {
                    "runs-on": "ubuntu-latest",
                    "steps": [
                        {"uses": "actions/checkout@v4"},
                        {"name": "Set up Python", "uses": "actions/setup-python@v4", "with": {"python-version": "3.11"}},
                        {"name": "Install dependencies", "run": "pip install -r requirements.txt"},
                        {"name": "Run tests", "run": "python -m pytest tests/"},
                        {"name": "Run linting", "run": "flake8 ."}
                    ]
                },
                "build": {
                    "runs-on": "ubuntu-latest",
                    "needs": "test",
                    "steps": [
                        {"uses": "actions/checkout@v4"},
                        {"name": "Set up Docker Buildx", "uses": "docker/setup-buildx-action@v3"},
                        {"name": "Build and push", "uses": "docker/build-push-action@v5", "with": {
                            "context": ".",
                            "push": True,
                            "tags": "valeo-neuroerp:latest"
                        }}
                    ]
                },
                "deploy": {
                    "runs-on": "ubuntu-latest",
                    "needs": "build",
                    "if": "github.ref == 'refs/heads/main'",
                    "steps": [
                        {"uses": "actions/checkout@v4"},
                        {"name": "Deploy to Kubernetes", "run": "kubectl apply -f k8s/"}
                    ]
                }
            }
        }
        
        return yaml.dump(workflow, default_flow_style=False)
    
    def create_monitoring_config(self) -> Dict[str, str]:
        """Erstellt Monitoring-Konfigurationen"""
        configs = {}
        
        # Prometheus Config
        configs["prometheus.yml"] = """
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'valeo-neuroerp-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:5432']
      
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']
"""
        
        # Grafana Dashboard
        configs["grafana-dashboard.json"] = """
{
  "dashboard": {
    "title": "VALEO-NeuroERP Dashboard",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph", 
        "targets": [
          {
            "expr": "pg_stat_database_numbackends"
          }
        ]
      }
    ]
  }
}
"""
        
        return configs
    
    def create_security_config(self) -> Dict[str, str]:
        """Erstellt Security-Konfigurationen"""
        configs = {}
        
        # Network Policies
        configs["network-policies.yaml"] = """
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: valeo-neuroerp-network-policy
  namespace: valeo-neuroerp
spec:
  podSelector:
    matchLabels:
      app: valeo-neuroerp
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
"""
        
        # RBAC
        configs["rbac.yaml"] = """
apiVersion: v1
kind: ServiceAccount
metadata:
  name: valeo-neuroerp-sa
  namespace: valeo-neuroerp
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: valeo-neuroerp-role
  namespace: valeo-neuroerp
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: valeo-neuroerp-rolebinding
  namespace: valeo-neuroerp
subjects:
- kind: ServiceAccount
  name: valeo-neuroerp-sa
  namespace: valeo-neuroerp
roleRef:
  kind: Role
  name: valeo-neuroerp-role
  apiGroup: rbac.authorization.k8s.io
"""
        
        return configs
    
    def create_terraform_config(self) -> str:
        """Erstellt Terraform-Konfiguration für Cloud-Infrastruktur"""
        terraform_config = """
# VALEO-NeuroERP Infrastructure as Code
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "valeo_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "valeo-neuroerp-vpc"
    Environment = var.environment
  }
}

# EKS Cluster
resource "aws_eks_cluster" "valeo_cluster" {
  name     = "valeo-neuroerp-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# RDS PostgreSQL
resource "aws_db_instance" "valeo_postgres" {
  identifier           = "valeo-neuroerp-postgres"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  username             = var.db_username
  password             = var.db_password
  skip_final_snapshot  = true
  
  tags = {
    Name = "valeo-neuroerp-postgres"
    Environment = var.environment
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "valeo_redis" {
  cluster_id           = "valeo-neuroerp-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
"""
        
        return terraform_config
    
    def generate_phase1_report(self) -> Dict[str, Any]:
        """Generiert einen vollständigen Phase 1 Bericht"""
        report = {
            "phase": "phase_1",
            "name": self.phase_name,
            "status": "in_progress",
            "start_date": self.start_date.isoformat(),
            "target_date": self.target_date.isoformat(),
            "duration": self.duration,
            "priority": self.priority,
            "components": self.components,
            "success_criteria": self.success_criteria,
            "configurations": {
                "docker_compose": self.create_docker_compose(),
                "kubernetes_manifests": self.create_kubernetes_manifests(),
                "github_actions": self.create_github_actions_workflow(),
                "monitoring": self.create_monitoring_config(),
                "security": self.create_security_config(),
                "terraform": self.create_terraform_config()
            },
            "next_steps": [
                {
                    "action": "Setup Development Environment",
                    "description": "Docker Compose für lokale Entwicklung einrichten",
                    "priority": "critical",
                    "deadline": (self.start_date + timedelta(days=7)).isoformat()
                },
                {
                    "action": "Setup CI/CD Pipeline",
                    "description": "GitHub Actions Workflow implementieren",
                    "priority": "critical", 
                    "deadline": (self.start_date + timedelta(days=14)).isoformat()
                },
                {
                    "action": "Setup Monitoring",
                    "description": "Prometheus und Grafana konfigurieren",
                    "priority": "high",
                    "deadline": (self.start_date + timedelta(days=21)).isoformat()
                },
                {
                    "action": "Setup Security Framework",
                    "description": "Network Policies und RBAC implementieren",
                    "priority": "critical",
                    "deadline": (self.start_date + timedelta(days=28)).isoformat()
                },
                {
                    "action": "Setup Production Infrastructure",
                    "description": "Terraform für Cloud-Infrastruktur deployen",
                    "priority": "high",
                    "deadline": (self.start_date + timedelta(days=35)).isoformat()
                }
            ]
        }
        
        return report
    
    def save_configurations(self, base_path: str = "."):
        """Speichert alle Konfigurationsdateien"""
        
        # Verzeichnisse erstellen
        directories = [
            "config/docker",
            "config/kubernetes", 
            "config/monitoring",
            "config/security",
            "config/terraform",
            ".github/workflows",
            "data/postgres",
            "data/redis",
            "data/elasticsearch",
            "data/prometheus",
            "data/grafana"
        ]
        
        for directory in directories:
            os.makedirs(os.path.join(base_path, directory), exist_ok=True)
        
        # Docker Compose
        with open(os.path.join(base_path, "docker-compose.yml"), "w") as f:
            f.write(self.create_docker_compose())
        
        # Kubernetes Manifests
        k8s_manifests = self.create_kubernetes_manifests()
        for filename, content in k8s_manifests.items():
            with open(os.path.join(base_path, "config/kubernetes", filename), "w") as f:
                f.write(content)
        
        # GitHub Actions
        with open(os.path.join(base_path, ".github/workflows/ci-cd.yml"), "w") as f:
            f.write(self.create_github_actions_workflow())
        
        # Monitoring Configs
        monitoring_configs = self.create_monitoring_config()
        for filename, content in monitoring_configs.items():
            with open(os.path.join(base_path, "config/monitoring", filename), "w") as f:
                f.write(content)
        
        # Security Configs
        security_configs = self.create_security_config()
        for filename, content in security_configs.items():
            with open(os.path.join(base_path, "config/security", filename), "w") as f:
                f.write(content)
        
        # Terraform
        with open(os.path.join(base_path, "config/terraform/main.tf"), "w") as f:
            f.write(self.create_terraform_config())

def main():
    """Hauptfunktion"""
    print("🏗️  VALEO-NeuroERP Phase 1: Foundation & Infrastructure Setup")
    print("=" * 70)
    
    # Phase 1 Setup initialisieren
    phase1 = Phase1InfrastructureSetup()
    
    # Bericht generieren
    report = phase1.generate_phase1_report()
    
    # Konfigurationen speichern
    print("\n📁 Erstelle Infrastruktur-Konfigurationen...")
    phase1.save_configurations()
    
    # Zusammenfassung ausgeben
    print(f"\n✅ Phase 1 Setup abgeschlossen!")
    print(f"   • Name: {phase1.phase_name}")
    print(f"   • Dauer: {phase1.duration}")
    print(f"   • Priorität: {phase1.priority}")
    print(f"   • Start: {phase1.start_date.strftime('%Y-%m-%d')}")
    print(f"   • Ziel: {phase1.target_date.strftime('%Y-%m-%d')}")
    
    # Komponenten
    print(f"\n🔧 Komponenten ({len(phase1.components)}):")
    for comp_id, comp in phase1.components.items():
        status_icon = "🔄" if comp["status"] == "pending" else "✅"
        print(f"   • {status_icon} {comp['name']} ({comp['priority']})")
    
    # Erfolgskriterien
    print(f"\n🎯 Erfolgskriterien ({len(phase1.success_criteria)}):")
    for criterion in phase1.success_criteria:
        print(f"   • {criterion}")
    
    # Nächste Schritte
    print(f"\n⚡ Nächste Schritte ({len(report['next_steps'])}):")
    for step in report['next_steps'][:3]:
        deadline = step['deadline'][:10]
        print(f"   • [{step['priority']}] {step['action']}")
        print(f"     Deadline: {deadline} | {step['description']}")
    
    # Bericht speichern
    filename = f"phase1_infrastructure_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Detaillierter Bericht gespeichert: {filename}")
    
    print(f"\n🚀 Phase 1 kann jetzt beginnen!")
    print(f"   • Docker Compose: docker-compose up -d")
    print(f"   • Kubernetes: kubectl apply -f config/kubernetes/")
    print(f"   • CI/CD: GitHub Actions Workflow aktiv")
    print(f"   • Monitoring: Prometheus + Grafana verfügbar")
    
    print("\n" + "=" * 70)
    print("Phase 1 Setup beendet")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Phase 1 Setup abgebrochen")
    except Exception as e:
        print(f"\n❌ Unerwarteter Fehler: {e}") 