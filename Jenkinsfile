pipeline {
  agent {
    node {
      label 'master'
    }

  }
  stages {
    stage('echo') {
      parallel {
        stage('echo') {
          steps {
            sh '''echo \'start\'
java --version'''
          }
        }

        stage('Check pom.xml') {
          steps {
            fileExists 'pom.xml'
          }
        }

      }
    }

    stage('Run Scan') {
      parallel {
        stage('Run Coverity') {
          steps {
            withCoverityEnvironment(coverityInstanceUrl: 'http://10.107.85.94:8080', createMissingProjectsAndStreams: true, credentialsId: 'Coverity94', projectName: '${COVERITY_PROJECT}', streamName: '${COVERITY_STREAM}', viewName: 'Outstanding Issues') {
              sh '''mvn --version
                echo ${cov-idir}
                echo "start cov-build ....."
                cov-build --dir ${cov-idir} mvn clean compile
                echo "start cov-capture ....."
                cov-capture --dir idir --source-dir .
                echo "start analyze ....."
                cov-analyze --dir idir --all --disable-spotbugs --webapp-security -j auto --enable-audit-mode
                echo ${COV_URL}
                cov-commit-defects --dir ${cov-idir} --url ${COV_URL} --stream ${COV_STREAM} --auth-key-file ${COV_AUTH_KEY_PATH}
              '''
            }

          }
        }

        stage('BlackDuck') {
          environment {
            ENV_NAME = 'clean package'
            DETECT_PLUGIN_ESCAPING = 'false'
          }
          steps {
            synopsys_detect(detectProperties: '--blackduck.trust.cert=true  --detect.project.version.name=${DETECT_VERSION} --detect.project.name=${DETECT_PROJECT} --detect.cleanup=true --blackduck.offline.mode=false  --detect.blackduck.signature.scanner.snippet.matching=NONE --detect.detector.search.depth=0 --detect.maven.build.command=${ENV_NAME} --detect.excluded.directories=idir ', returnStatus: true)
          }
        }

      }
    }

    stage('Coverity results') {
      steps {
        coverityIssueCheck(coverityInstanceUrl: 'http://10.107.85.94:8080', credentialsId: 'Coverity94', markUnstable: true, viewName: 'Outstanding Issues', returnIssueCount: true, projectName: '${COVERITY_PROJECT}')
      }
    }

    stage('CodeDX') {
      steps {
        step([$class: 'CodeDxPublisher', analysisName: 'Build #${BUILD_NUMBER}', analysisResultConfiguration: [failureOnlyNew: false, failureSeverity: 'None', numBuildsInGraph: 0, policyBreakBuildBehavior: 'NoAction', unstableOnlyNew: false, unstableSeverity: 'None'],baseBranchName: 'main', key: 'api-key:hkZpD1V2WEpsMjC-cGjr5C24B2HDtvbp9FR4HQ5f', projectId: '6', selfSignedCertificateFingerprint: '', sourceAndBinaryFiles: '**',targetBranchName: 'AltoroJ', url: 'http://10.107.85.95:81/codedx'])
      }
    }

    stage('Nexus') {
      steps {
        nexusArtifactUploader(artifacts: [[artifactId: 'AltoroJ_mvn', classifier: '', file: 'target/AltoroJ_mvn.war', type: 'war']], credentialsId: 'jenkins-user', groupId: 'com.ibm.rational.appscan.altoromutual', nexusUrl: '10.107.72.6:31368', nexusVersion: 'nexus3', protocol: 'http', repository: 'maven-central-repo', version: '1.0-SNAPSHOT')
      }
    }

    stage('Docker Build') {
      steps {
        sh "docker build -t age68573/altoroj:${IMAGE_VERSION} ."
      }
    }

    stage('Docker Push') {
      steps {
        script {
          withCredentials([string(credentialsId: 'dockerhub', variable: 'dockerhub')]) {
            sh "docker login -u age68573 -p ${dockerhub}"
            sh "docker push age68573/altoroj:${IMAGE_VERSION}"
          }
        }

      }
    }

    stage('Update Deployment File') {
      environment {
        GIT_REPO_NAME = 'AltoroJ'
        GIT_USER_NAME = 'age68573'
      }
      steps {
        withCredentials(bindings: [string(credentialsId: 'Github_Token', variable: 'GITHUB_TOKEN')]) {
          sh '''
                    git config user.email "s1410523045@gms.nutc.edu.tw"
                    git config user.name "age68573"
                    sed -i "s/replaceImageTag/${IMAGE_VERSION}/g" deploy/deployment.yaml
                    git add deploy/deployment.yaml
                    git commit -m "Update deployment image to version ${IMAGE_VERSION}"
                    git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:main --force
                '''
        }

      }
    }
    stage('cypress') {
      steps {
        sh ' docker run  -v $PWD:/e2e -w /e2e  cypress/included --spec ./cypress/e2e/spec.cy.js'
      }
    }
    stage('Seeker') {
      steps {
        synopsysSeeker(projectKey: 'altoroj_eap74', reportFormat: 'pdf', condition: 'NONE')
      }
    }

  }
  tools {
    maven 'maven3.9'
    jdk 'java17'
  }
  environment {
    IMAGE_VERSION = '2'
    COVERITY_PROJECT = 'AltoroJ'
    COVERITY_STREAM = 'AltoroJ-1'
    DETECT_VERSION = 'v0.1'
    DETECT_PROJECT = 'AltoroJ'
  }
}
