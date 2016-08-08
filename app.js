var pixelApp = angular.module('pixelApp', []);

pixelApp.controller('ImageListCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    $scope.images = [];
    
    var socketio = io.connect();
	console.log("sock it " + socketio);
	socketio.on("images_to_client",function(data) {
        $scope.$apply(function() {
            $scope.images = data;
            $scope.test = "else";
            console.log($scope.images);
        });
    });
    socketio.emit("load_images", "");
    
    $scope.setColor = function(selectedColor){
        $scope.selectedColor = selectedColor;
    }
    
    $scope.colorFilter = function(image)
    {
        if ($scope.selectedColor == "red") {
            return image.concentration.red;
        } else if ($scope.selectedColor == "green") {
            return image.concentration.green;
        } else if ($scope.selectedColor == "blue") {
            return image.concentration.blue;
        } else {
            return true;
        }
    };
    
    
  }]);