pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "kartikhiremath/weather_app:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Trivy Vulnerability Scan') {
            steps {
                sh 'command -v trivy'
                sh 'trivy fs --exit-code 0 --severity LOW,MEDIUM,HIGH .'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    withSonarQubeEnv('My SonarQube Server') {
                        sh """
                            sonar-scanner \
                            -Dsonar.projectKey=weather_app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_IMAGE
                        docker logout
                    """
                }
            }
        }

        stage('Deploy (Optional)') {
            when {
                expression { return env.DEPLOY == 'true' }
            }
            steps {
                echo 'Deploying container...'
                // Add your custom deployment script here (e.g. Docker run, kubectl apply, etc.)
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully ✅'
        }
        failure {
            echo 'Pipeline failed ❌'
        }
    }
}

