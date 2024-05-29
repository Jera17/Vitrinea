(function() {
    emailjs.init("jgWzsk6ZY8IW3pakh"); // Id de mi usuario o el usuario quien manda el correo
})();

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sendEmailButton').addEventListener('click', function() {
        
        var templateParams = {
            to_name: 'Luisito uwu', //Nombre de ejemplo de usuario
            to_email: 'jjera2617@gmail.com', //Correo de ejemplo de usuario
            message: 'Aqui deberia haber un mensaje pero por ahora no lo hay UwU.', //Mensaje para el usuario
            from_name: 'Vitrinea' //Nombre de quien lo envia
        };
        console.log(templateParams)
        emailjs.send('service_9k7eo7z', 'template_y1thtqa', templateParams)
            .then(function(response) {
                console.log('Correo enviado exitosamente!', response.status, response.text);
            }, function(error) {
                console.log('Fallo al enviar el correo...', error);
            });
    });
});
