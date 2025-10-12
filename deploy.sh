#!/bin/bash

# =============================================================================
# NORMALDANCE DEPLOYMENT SCRIPT
# =============================================================================
# Автоматическое развертывание в Docker или Kubernetes
# Использование: ./deploy.sh [docker|kubernetes|minimal] [dev|prod]
# =============================================================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка аргументов
DEPLOY_TYPE=${1:-docker}
ENV=${2:-dev}

log_info "=== NORMALDANCE DEPLOYMENT ==="
log_info "Type: $DEPLOY_TYPE"
log_info "Environment: $ENV"
log_info "================================"

# Функция проверки зависимостей
check_dependencies() {
    log_info "Проверка зависимостей..."
    
    case $DEPLOY_TYPE in
        "docker")
            if ! command -v docker &> /dev/null; then
                log_error "Docker не найден. Установите Docker Desktop."
                exit 1
            fi
            
            if ! command -v docker-compose &> /dev/null; then
                log_error "Docker Compose не найден."
                exit 1
            fi
            
            # Проверка Docker daemon
            if ! docker info &> /dev/null; then
                log_error "Docker daemon не запущен. Запустите Docker Desktop."
                exit 1
            fi
            ;;
            
        "kubernetes")
            if ! command -v kubectl &> /dev/null; then
                log_error "kubectl не найден. Установите kubectl."
                exit 1
            fi
            
            # Проверка подключения к кластеру
            if ! kubectl cluster-info &> /dev/null; then
                log_error "Не удалось подключиться к Kubernetes кластеру."
                exit 1
            fi
            ;;
    esac
    
    log_success "Все зависимости найдены"
}

# Функция проверки переменных окружения
check_env_files() {
    log_info "Проверка файлов окружения..."
    
    if [ "$ENV" = "prod" ]; then
        if [ ! -f ".env.production" ]; then
            log_error "Файл .env.production не найден."
            exit 1
        fi
        
        # Проверка критичных переменных
        source .env.production
        
        if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"your-"* ]]; then
            log_warning "DATABASE_URL не настроен в .env.production"
        fi
        
        if [ -z "$NEXTAUTH_SECRET" ] || [[ "$NEXTAUTH_SECRET" == *"your-"* ]]; then
            log_warning "NEXTAUTH_SECRET не настроен в .env.production"
        fi
        
    else
        if [ ! -f ".env.local" ]; then
            log_info "Создание .env.local из шаблона..."
            cp .env.example .env.local 2>/dev/null || {
                log_warning "Файл .env.example не найден. Создаю базовый .env.local"
                cat > .env.local << EOF
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/normaldance"
NEXTAUTH_SECRET="dev_secret_key_change_me"
NEXTAUTH_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
EOF
            }
        fi
    fi
    
    log_success "Файлы окружения проверены"
}

# Функция развертывания в Docker
deploy_docker() {
    log_info "Развертывание в Docker..."
    
    case $ENV in
        "dev")
            log_info "Запуск development окружения..."
            docker-compose up -d --build
            
            log_info "Ожидание запуска сервисов..."
            sleep 10
            
            log_success "Development окружение запущено!"
            echo "Доступные сервисы:"
            echo "  - Application: http://localhost:3000"
            echo "  - Database: localhost:5432"
            echo "  - Redis: localhost:6379"
            ;;
            
        "prod")
            log_info "Запуск production окружения..."
            docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
            
            log_info "Ожидание запуска сервисов..."
            sleep 30
            
            log_success "Production окружение запущено!"
            echo "Доступные сервисы:"
            echo "  - Application: http://localhost:3000"
            echo "  - API Gateway: http://localhost:8080"
            echo "  - WebSocket: ws://localhost:3001"
            echo "  - Grafana: http://localhost:3001"
            echo "  - Prometheus: http://localhost:9090"
            echo "  - Kibana: http://localhost:5601"
            ;;
            
        "minimal")
            log_info "Запуск минимального окружения..."
            docker-compose -f docker-compose.minimal.yml up -d --build
            
            log_info "Ожидание запуска сервисов..."
            sleep 10
            
            log_success "Минимальное окружение запущено!"
            echo "Доступные сервисы:"
            echo "  - Application: http://localhost:3000"
            echo "  - Database: localhost:5432"
            ;;
    esac
}

# Функция развертывания в Kubernetes
deploy_kubernetes() {
    log_info "Развертывание в Kubernetes..."
    
    # Создание namespace'ов
    log_info "Создание namespace'ов..."
    kubectl apply -f k8s/namespace.yaml
    
    # Создание секретов
    log_info "Создание секретов..."
    if [ "$ENV" = "prod" ]; then
        if [ -f "k8s/secrets.yaml" ]; then
            kubectl apply -f k8s/secrets.yaml
        else
            log_warning "Файл k8s/secrets.yaml не найден. Создайте его из .env.production"
            log_info "Пример команды для создания секретов:"
            echo "kubectl create secret generic normaldance-secrets \\"
            echo "  --from-literal=DATABASE_URL=\"\$DATABASE_URL\" \\"
            echo "  --from-literal=NEXTAUTH_SECRET=\"\$NEXTAUTH_SECRET\" \\"
            echo "  --namespace normaldance-production"
        fi
    fi
    
    # Применение манифестов
    log_info "Применение Kubernetes манифестов..."
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/deployment.yaml
    
    if [ "$ENV" = "prod" ]; then
        kubectl apply -f k8s/network-policy.yaml
    fi
    
    # Ожидание запуска подов
    log_info "Ожидание запуска подов..."
    namespace="normaldance"
    if [ "$ENV" = "prod" ]; then
        namespace="normaldance-production"
    fi
    
    kubectl wait --for=condition=ready pod -l app=normaldance -n $namespace --timeout=300s
    
    log_success "Kubernetes развертывание завершено!"
    echo "Проверка статуса:"
    echo "  kubectl get pods -n $namespace"
    echo "  kubectl get services -n $namespace"
    
    # Инструкция по доступу
    if command -v minikube &> /dev/null && minikube status | grep -q "Running"; then
        echo "Minikube IP: $(minikube ip)"
        echo "Доступ через minikube tunnel:"
        echo "  minikube tunnel"
    fi
}

# Функция проверки работоспособности
health_check() {
    log_info "Проверка работоспособности..."
    
    case $DEPLOY_TYPE in
        "docker")
            # Проверка health check для Docker
            if docker-compose ps | grep -q "Up (healthy)"; then
                log_success "Сервисы работают корректно"
            else
                log_warning "Некоторые сервисы могут иметь проблемы"
                docker-compose ps
            fi
            ;;
            
        "kubernetes")
            namespace="normaldance"
            if [ "$ENV" = "prod" ]; then
                namespace="normaldance-production"
            fi
            
            ready_pods=$(kubectl get pods -n $namespace --field-selector=status.phase=Running --no-headers | wc -l)
            total_pods=$(kubectl get pods -n $namespace --no-headers | wc -l)
            
            if [ "$ready_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
                log_success "Все поды ($ready_pods/$total_pods) запущены"
            else
                log_warning "Не все поды запущены: $ready_pods/$total_pods"
                kubectl get pods -n $namespace
            fi
            ;;
    esac
}

# Функция отображения логов
show_logs() {
    log_info "Показ логов..."
    
    case $DEPLOY_TYPE in
        "docker")
            docker-compose logs -f --tail=100
            ;;
            
        "kubernetes")
            namespace="normaldance"
            if [ "$ENV" = "prod" ]; then
                namespace="normaldance-production"
            fi
            
            kubectl logs -f deployment/normaldance-app -n $namespace
            ;;
    esac
}

# Функция очистки
cleanup() {
    log_info "Очистка..."
    
    case $DEPLOY_TYPE in
        "docker")
            docker-compose down -v 2>/dev/null || docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
            ;;
            
        "kubernetes")
            kubectl delete -f k8s/ --ignore-not-found=true
            ;;
    esac
    
    log_success "Очистка завершена"
}

# Главное меню
main() {
    check_dependencies
    check_env_files
    
    case $DEPLOY_TYPE in
        "docker"|"kubernetes"|"minimal")
            # Развертывание
            if [ "$DEPLOY_TYPE" = "minimal" ]; then
                deploy_docker
            elif [ "$DEPLOY_TYPE" = "docker" ]; then
                deploy_docker
            else
                deploy_kubernetes
            fi
            
            # Проверка работоспособности
            sleep 5
            health_check
            
            log_success "Развертывание завершено!"
            log_info "Для просмотра логов: $0 logs $DEPLOY_TYPE $ENV"
            log_info "Для очистки: $0 cleanup $DEPLOY_TYPE $ENV"
            ;;
            
        "logs")
            show_logs
            ;;
            
        "cleanup")
            cleanup
            ;;
            
        "status")
            health_check
            ;;
            
        *)
            echo "Использование: $0 [docker|kubernetes|minimal|logs|cleanup|status] [dev|prod]"
            echo ""
            echo "Команды:"
            echo "  docker     - Развернуть в Docker контейнерах"
            echo "  kubernetes - Развернуть в Kubernetes"
            echo "  minimal    - Минимальная Docker конфигурация"
            echo "  logs       - Показать логи"
            echo "  cleanup    - Очистить развертывание"
            echo "  status     - Проверить статус"
            echo ""
            echo "Окружения:"
            echo "  dev        - Development (по умолчанию)"
            echo "  prod       - Production"
            exit 1
            ;;
    esac
}

# Обработка сигналов
trap cleanup EXIT

# Запуск
main "$@"
