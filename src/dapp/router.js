
var AppRouter = Backbone.Router.extend({
    routes: {
        'nowplaying': 'nowplaying',
        'schedule': 'schedule',
        '*actions': 'home'
    }
});

var initialize = function () {
    var appRouter = new AppRouter;

    console.log(appRouter)
    appRouter.on('route:nowplaying', function () {
        $('#app').text("About");
    });

    appRouter.on('route:home', function () {
        $('#app').text("Home Screen");
    });



};

module.exports = initialize;