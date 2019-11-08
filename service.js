var Service = require('node-windows').Service;

// Create a new service object
 var svc = new Service({
 name:'API ColetorAPP',
 description: 'Sistema integrado com o coletor app',
 script: 'E:\\_Projetos WEB\\ConsultaPrecoAPP\\backNode\\Server.js'
 });

//Listen for the "install" event, which indicates the
//process is available as a service.
svc.on('install',function(){
svc.start();
});
svc.install();

