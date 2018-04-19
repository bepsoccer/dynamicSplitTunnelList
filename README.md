# dynamicSplitTunnelList

Runs an iControl LX extension on a BIG-IP that updates a Network Access's split tunnel config dynamically.

Initially this is setup to just update the NA object to split tunnel just address for O365 published at https://support.content.office.net/en-us/static/O365IPAddresses.xml.  The plan is to eventually make it more extensible for other inputs.

# Instructions

All settings are currently hard coded in [settings.json](/nodejs/settings.json).

## Deployment
1. Copy the rpm package to /var/config/rest/downloads
2. Run curl -u user:pass -X POST http://localhost:8100/mgmt/shared/iapp/package-management-tasks -d '{ "operation":"INSTALL","packageFilePath": "/var/config/rest/downloads/dynamicSplitTunnelList-0.1-001.noarch.rpm"}'

For more information see [DevCentral](https://devcentral.f5.com/Wiki/Default.aspx?Page=HowToSamples_deploy_icontrol_extension&NS=iControlLX).

##Usage
First update the networkAccessObject property in [settings.json](/nodejs/settings.json) file using the [F5 Exclipse plug-in](https://devcentral.f5.com/articles/f5-programmability-for-eclipse-installation-instructions-20883) to your NA object and the worker should restart using the new setting.  Then just run a simple GET to https://{{your_host}}/mgmt/shared/dynamicSplitTunnelList/updateO365addresses.

In future a future release this will most like be changed to a POST, PUT, or PATCH that will accept input parameters so the settings aren't hardcoded.  The is just a working pre-release.
