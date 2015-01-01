// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: '../static/js/libs',
    paths: {
        app: '/static/js/app',
        bootstrap: '/static/bootstrap/js/bootstrap.min',
        socketio: '/socket.io/socket.io'
        //jquery: 'http://code.jquery.com/jquery-2.1.3'
    },
    shim: {
        "bootstrap": {
            "deps": ['jquery']
        }
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);