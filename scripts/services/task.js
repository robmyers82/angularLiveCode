'use strict';

app.factory('Task', function(FURL, $firebase, Auth) {
	var ref = new Firebase(FURL);
	
	var tasks = $firebase(ref.child('tasks')).$asArray();
	tasks.$loaded().then(function() {
        for (var i = 0; i < tasks.length; i++) {
			tasks[i].start = new Date(tasks[i].start);
		}
		for (var i = 0; i < tasks.length; i++) {
			tasks[i].end = new Date(tasks[i].end);
		}
		console.log(tasks);
    });

	var user = Auth.user;

	var Task = {
		all: tasks,

		getTask: function(taskId) {
			return $firebase(ref.child('tasks').child(taskId));
		},

		createTask: function(task) {
			task.start = task.start.getTime();
			task.end = task.end.getTime();
			task.datetime = Firebase.ServerValue.TIMESTAMP;
			return tasks.$add(task).then(function(newTask) {
				
				// Create User-Tasks lookup record for POSTER
				var obj = {
					taskId: newTask.key(),
					type: true,
					title: task.title
				};

				return $firebase(ref.child('user_tasks').child(task.poster)).$push(obj);
			});
		},

		createUserTasks: function(taskId) {
			Task.getTask(taskId)
				.$asObject()
				.$loaded()
				.then(function(task) {
					
					// Create User-Tasks lookup record for RUNNER
					var obj = {
						taskId: taskId,
						type: false,
						title: task.title
					}

					return $firebase(ref.child('user_tasks').child(task.runner)).$push(obj);	
				});	
		},

		editTask: function(task) {
			var t = this.getTask(task.$id);			
			return t.$update({title: task.title, description: task.description, total: task.total});
		},

		cancelTask: function(taskId) {
			var t = this.getTask(taskId);
			return t.$update({status: "cancelled"});
		},

		isCreator: function(task) {			
			return (user && user.provider && user.uid === task.poster);
		},

		isOpen: function(task) {
			return task.status === "open";
		},

		// --------------------------------------------------//

		isAssignee: function(task) {
			return (user && user.provider && user.uid === task.runner);	
		},

		completeTask: function(taskId) {
			var t = this.getTask(taskId);
			return t.$update({status: "completed"});
		},

		isCompleted: function(task) {
			return task.status === "completed";
		}
	};

	return Task;

});