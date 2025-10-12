# Развертывание NORMALDANCE в Kubernetes

## 📋 Требования

1. **Kubernetes кластер** (minikube, Docker Desktop K8s, GKE, EKS, AKS)
2. **kubectl** настроенный для подключения к кластеру
3. **Helm 3.0+** (рекомендуется)
4. **4GB+ RAM** и **2+ CPU cores**

## 🚀 Быстрый старт

### 1. Запуск Kubernetes кластера

#### Вариант A: Docker Desktop (рекомендуется для локальной разработки)
```bash
# Включите Kubernetes в Docker Desktop
# Settings > Kubernetes > Enable Kubernetes
# Apply & Restart
```

#### Вариант B: Minikube
```bash
# Установка (Windows)
choco install minikube

# Запуск
minikube start --memory=4096 --cpus=2

# Включение аддонов
minikube addons enable ingress
minikube addons enable metrics-server
```

#### Вариант C: Google Kubernetes Engine (GKE)
```bash
# Создание кластера
gcloud container clusters create normaldance \
    --num-nodes=3 \
    --machine-type=e2-standard-2 \
    --region=us-central1

# Настройка kubectl
gcloud container clusters get-credentials normaldance \
    --region=us-central1
```

### 2. Проверка кластера
```bash
# Статус кластера
kubectl cluster-info

# Узлы
kubectl get nodes

# Namespace'ы
kubectl get namespaces
```

## 🐳 Развертывание через Kubernetes манифесты

### 1. Создание namespace'ов
```bash
# Применение namespace конфигурации
kubectl apply -f k8s/namespace.yaml

# Проверка
kubectl get namespaces | grep normaldance
```

### 2. Создание секретов
```bash
# Применение секретов
kubectl apply -f k8s/secrets.yaml

# Проверка
kubectl get secrets -n normaldance-production
```

### 3. Развертывание приложения
```bash
# ConfigMap
kubectl apply -f k8s/configmap.yaml

# Service
kubectl apply -f k8s/service.yaml

# Deployment
kubectl apply -f k8s/deployment.yaml

# Network Policies
kubectl apply -f k8s/network-policy.yaml
```

### 4. Проверка развертывания
```bash
# Статус подов
kubectl get pods -n normaldance-production

# Логи приложения
kubectl logs -f deployment/normaldance-app -n normaldance-production

# Проброс порта для тестирования
kubectl port-forward svc/normaldance-service 3000:80 -n normaldance-production
```

## ⚙️ Развертывание через Helm (рекомендуется)

### 1. Установка Helm
```bash
# Windows
choco install kubernetes-helm

# Linux/macOS
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 2. Развертывание
```bash
# Development
helm install normaldance-dev ./helm/normaldance \
    --namespace normaldance \
    --create-namespace \
    --values helm/normaldance/values.yaml

# Production
helm install normaldance-prod ./helm/normaldance \
    --namespace normaldance-production \
    --create-namespace \
    --values helm/normaldance/values-production.yaml

# Обновление
helm upgrade normaldance-prod ./helm/normaldance \
    --namespace normaldance-production \
    --values helm/normaldance/values-production.yaml
```

### 3. Управление Helm
```bash
# Список релизов
helm list --namespace normaldance-production

# Удаление
helm uninstall normaldance-prod --namespace normaldance-production

# История изменений
helm history normaldance-prod --namespace normaldance-production
```

## 🔧 Конфигурация

### Production values (helm/normaldance/values-production.yaml)
```yaml
# Глобальные настройки
global:
  env:
    NODE_ENV: production
    LOG_LEVEL: info
  domain: normaldance.app

# Реплики
replicaCount: 3

# Ресурсы
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"

# Auto-scaling
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

# Ingress
ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
  tls:
    - secretName: normaldance-tls
      hosts:
        - normaldance.app
```

### Переменные окружения
```yaml
#.ConfigMap
env:
  NODE_ENV: production
  LOG_LEVEL: info
  REDIS_HOST: "redis-service"
  DATABASE_HOST: "postgres-service"

# Secrets (через kubectl)
kubectl create secret generic normaldance-secrets \
    --from-literal=DATABASE_URL="postgresql://..." \
    --from-literal=NEXTAUTH_SECRET="..." \
    --namespace normaldance-production
```

## 🔍 Мониторинг и логирование

### 1. Prometheus + Grafana
```bash
# Установка Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --create-namespace

# Настройка ServiceMonitor
kubectl apply -f k8s/servicemonitor.yaml
```

### 2. Логирование (ELK Stack)
```bash
# Elasticsearch
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
    --namespace logging \
    --create-namespace

# Kibana
helm install kibana elastic/kibana \
    --namespace logging

# Logstash
helm install logstash elastic/logstash \
    --namespace logging
```

### 3. Доступ к мониторингу
```bash
# Проброс портов
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
kubectl port-forward svc/kibana-kb-http 5601:5601 -n logging

# Grafana: http://localhost:3000 (admin/prom-operator)
# Kibana: http://localhost:5601
```

## 🔒 Безопасность

### 1. Network Policies
```yaml
# k8s/network-policy.yaml уже включает:
# - Ограничение трафика между подами
# - Разрешение только необходимых портов
# - Изоляция по namespace'ам
```

### 2. Pod Security
```yaml
# Security Context в Deployment
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

# Контейнер level
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

### 3. RBAC
```yaml
# k8s/rbac.yaml - настроен на минимальные привилегии
# ServiceAccount с ограниченными правами
# Role и RoleBinding для namespace'а
```

## 📊 Horizontal Pod Autoscaler

```bash
# Включение HPA
kubectl autoscale deployment normaldance-app \
    --namespace normaldance-production \
    --cpu-percent=70 \
    --min=3 \
    --max=10

# Проверка
kubectl get hpa -n normaldance-production
```

## 🔧 Управление

### 1. Обновление приложения
```bash
# Через Kubernetes
kubectl set image deployment/normaldance-app \
    normaldance-app=ghcr.io/normaldance/app:v2.0.0 \
    --namespace normaldance-production

# Через Helm
helm upgrade normaldance-prod ./helm/normaldance \
    --namespace normaldance-production \
    --set image.tag=v2.0.0
```

### 2. Откат
```bash
# Kubernetes rollback
kubectl rollout undo deployment/normaldance-app \
    --namespace normaldance-production

# Helm rollback
helm rollback normaldance-prod 1 --namespace normaldance-production
```

### 3. Scaling
```bash
# Вручную
kubectl scale deployment normaldance-app --replicas=5 \
    --namespace normaldance-production

# Через Helm
helm upgrade normaldance-prod ./helm/normaldance \
    --set replicaCount=5 \
    --namespace normaldance-production
```

## 🚨 Проблемы и решения

### Pod не запускается
```bash
# Проверка статуса
kubectl describe pod <pod-name> -n normaldance-production

# Проверка событий
kubectl get events -n normaldance-production --sort-by='.lastTimestamp'

# Логи
kubectl logs <pod-name> -n normaldance-production
```

### Проблемы с ресурсами
```bash
# Проверка использования
kubectl top nodes
kubectl top pods -n normaldance-production

# Увеличение лимитов
kubectl patch deployment normaldance-app -p \
    '{"spec":{"template":{"spec":{"containers":[{"name":"normaldance-app","resources":{"limits":{"memory":"2Gi"}}}]}}}}' \
    --namespace normaldance-production
```

### Проблемы с сетью
```bash
# Проверка Service
kubectl get svc -n normaldance-production
kubectl describe svc normaldance-service -n normaldance-production

# Проверка Ingress
kubectl get ingress -n normaldance-production
kubectl describe ingress normaldance-ingress -n normaldance-production
```

## 📁 Полезные команды

```bash
# Контекст и namespace
kubectl config use-context <context>
kubectl config set-context --current --namespace=normaldance-production

# Быстрый доступ к shell пода
kubectl exec -it <pod-name> -n normaldance-production -- /bin/bash

# Копирование файлов
kubectl cp ./local-file <pod-name>:/remote-path -n normaldance-production

# Порт форвардинг
kubectl port-forward svc/normaldance-service 3000:80 -n normaldance-production

# Watch ресурсы
kubectl get pods -n normaldance-production -w
kubectl get hpa -n normaldance-production -w
```

## 🔄 CI/CD интеграция

### GitHub Actions
```yaml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure kubectl
        uses: azure/k8s-set-context@v1
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
      - name: Deploy with Helm
        run: |
          helm upgrade --install normaldance-prod ./helm/normaldance \
            --namespace normaldance-production \
            --values helm/normaldance/values-production.yaml
```

## 🎯 Production checklist

- [ ] Kubernetes кластер запущен и настроен
- [ ] Namespace'ы созданы
- [ ] Secrets настроены с реальными значениями
- [ ] Ingress настроен с SSL сертификатами
- [ ] Мониторинг настроен (Prometheus/Grafana)
- [ ] Логирование настроено (ELK)
- [ ] HPA настроен для auto-scaling
- [ ] Backup策略 реализован
- [ ] Security policies применены
- [ ] Health checks работают

---

## 🚀 Следующие шаги

1. ✅ Запустите Kubernetes кластер
2. ✅ Примените `kubectl apply -f k8s/`
3. ✅ Или используйте `helm install`
4. ✅ Настройте Ingress для внешнего доступа
5. ✅ Настройте мониторинг
6. ✅ Проверьте работоспособность

Для production рекомендуется использовать Helm для управления конфигурациями и обновлениями.
