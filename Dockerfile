FROM registry.redhat.io/jboss-eap-7/eap74-openjdk17-openshift-rhel8:7.4.10-3
COPY ./target/*.war /opt/eap/standalone/deployments/


CMD ["/opt/eap/bin/openshift-launch.sh"]