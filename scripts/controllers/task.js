'use strict';

app.controller('TaskController', function($scope, $location, $http, toaster, Task, Auth) {

	$scope.createTask = function() {	
		$scope.task.status = 'open';
		$scope.task.gravatar = Auth.user.profile.gravatar;
		$scope.task.name = Auth.user.profile.name;
		$scope.task.poster = Auth.user.uid;

		$http.get("http://maps.googleapis.com/maps/api/geocode/json?address="+$scope.task.location).then(function(result) {

			$scope.task.lat = result.data.results[0].geometry.location.lat;
			$scope.task.lng = result.data.results[0].geometry.location.lng;

			Task.createTask($scope.task).then(function(ref) {
				toaster.pop('success', 'Task created successfully.');
				$scope.task = {title: '', description: '', total: '', status: 'open', gravatar: '', name: '', poster: ''};
				$location.path('/browse/' + ref.key());
			});

	    }, function(error) {
	        alert("There was a problem.");
	        alert(error);
	    });
	};

	$scope.editTask = function(task) {
		Task.editTask(task).then(function() {			
			toaster.pop('success', "Task is updated.");
		});
	};
	
});