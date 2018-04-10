const app = angular.module('app', ['ngRoute']);
const {remote} = require('electron');

app.service('image', function () {
    let imagePath = "";
    let dimensions = [];
    this.setImagePath = function (path) {
        imagePath = path;
    };
    this.getImagePath = function (path) {
        return imagePath;
    };
    this.setImageDimensions = function (imgDimensions) {
        dimensions = imgDimensions;
    };
    this.getImageDimensions = function (imgDimensions) {
        return dimensions;
    };
});

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: `${__dirname}./components/home/home.html`,
        controller: 'homeCtrl'
    }).when('/edit', {
        templateUrl: `${__dirname}./components/editImage/editImage.html`,
        controller: 'editCtrl'
    }).otherwise({
        template: '404'
    });
});

app.controller('headCtrl', function ($scope) {
    const win = remote.getCurrentWindow();
    $scope.close = function () {
        win.close();
    };
    $scope.maximize = function () {
        win.isMaximized() ? win.unmaximize() : win.maximize();
    };
    $scope.minimize = function () {
        win.minimize();
    };
});

app.controller('homeCtrl', function ($scope, $location, image) {
    $scope.pickFile = function () {
        const {dialog} = remote;

        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{
                name: 'Images',
                extensions: ['jpg', 'jpeg', 'png']
            }]
        }, function (file) {
            if(!!file){
                const path = file[0];
                image.setImagePath(path);

                let sizeof = require("image-size");
                let dimensions = sizeof(path);
                image.setImageDimensions(dimensions);

                $location.path('/edit');
                $scope.$apply();
            }
        });
    };
});

app.controller('editCtrl', function ($scope, image, $location) {
    $scope.imagePath = image.getImagePath();
    $scope.controlsActive = false;

    let generatedStyles = "";
    let imageReference = document.getElementById("mainImage");

    $scope.effects = {
        'Brightness': {val: 100, min: 0, max: 200, delim: "%"},
        'Contrast': {val: 100, min: 0, max: 200, delim: "%"},
        'Invert': {val: 0, min: 0, max: 100, delim: "%"},
        'Hue-rotate': {val: 0, min: 0, max: 360, delim: "deg"},
        'Sepia': {val: 0, min: 0, max: 100, delim: "%"},
        'Grayscale': {val: 0, min: 0, max: 100, delim: "%"},
        'Saturate': {val: 100, min: 0, max: 200, delim: "%"},
        'Blur': {val: 0, min: 0, max: 5, delim: "px"}
    };

    $scope.imageEffect = function (effectName) {
        $scope.controlsActive = true;
        $scope.activeEffect = effectName;
    };

    $scope.setEffect = function () {
        let generatedStyles = "";
        for(let i in $scope.effects){
            generatedStyles += `${i}(${$scope.effects[i].val + $scope.effects[i].delim}) `;
        }
        console.log(generatedStyles);
        imageReference.style.filter = generatedStyles;
    };

    $scope.hideThis = function () {
        $scope.controlsActive = false;
    };

    $scope.change = function () {
        $location.path('/');
    };

    $scope.save = function () {
        const {BrowserWindow} = remote;
        let dimensions = image.getImageDimensions();
        let src = image.getImagePath();
        let styles = imageReference.style.filter;

        let win = new BrowserWindow({
            frame: false,
            show: false,
            width: dimensions.width,
            height: dimensions.height,
            webPreferences: {
                webSecurity: false
            }
        });
        win.loadURL(`data:text/html,
            <style>*{margin:0; padding:0;}</style>
            <img src="${src}" style="filter: ${styles}">
            <script>
                let screenShot = require('electron-screenshot');
                screenShot({
                    filename: 'userFile.png',
                    delay: 1000
                });
            </script>
        `);
    };
});