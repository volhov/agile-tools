angular.module('agile.controllers')
    .controller('Performance_Tasks', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'dateFormatFilter',
        function($scope, TEMPLATES_URL, Api, Helper, dateFormatFilter) {

            $scope.template = TEMPLATES_URL + '/performance/tasks.html';

            $scope.loadingTasksStats = false;
            $scope.jql = '';
            $scope.limit = 200;
            $scope.$on('reload-stats', reloadStats);

            function reloadStats() {
                 $scope.loadingTasksStats = true;
                 try {
                     loadTasks().then(function() {
                         $scope.stats.tasks = analyzeTasks($scope.tasks);
                         $scope.loadingTasksStats = false;
                         drawTasksChart($scope.stats.tasks);
                     });
                 } catch (e) {
                     $scope.loadingTasksStats = false;
                     Helper.setAlert('warning', e.message);
                 }
            }

            function loadTasks()
            {
                if (!$scope.user) {
                    throw {
                        message: "User is not loaded yet."
                    };
                }
                var jql = 'issuetype in (Task, Sub-task) AND status in (Resolved, Closed) ' +
                    ' AND created <= "' + dateFormatFilter('now', 'YYYY-MM-DD') + '"' + // this is to cache issues per day
                    ' AND assignee = ' + $scope.user.key;
                if ($scope.filters.project) {
                    jql += ' AND project = ' + $scope.filters.project.key;
                }

                $scope.jql = jql;

                return Api.get('JiraIssues').get({
                    jql: jql,
                    _fields: "summary,worklog,timetracking",
                    max_result: $scope.limit
                }).then(function(tasks) {
                    $scope.tasks = tasks;
                });
            }

            function analyzeTasks(tasks)
            {
                var totalEstimatedTime = 0;
                var totalSpentTime = 0;
                var perTask = [];
                for (var i = 0; i < tasks.length; i++) {
                    var timespent = null;
                    var estimated = tasks[i].fields.timetracking.originalEstimateSeconds;

                    if (!estimated) {
                        continue;
                    }

                    try {
                        for (var j = 0; j < tasks[i].fields.worklog.worklogs.length; j++) {
                            var worklog = tasks[i].fields.worklog.worklogs[j];
                            if (worklog.author.name == $scope.user.key) {
                                timespent += worklog.timeSpentSeconds;
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    if (timespent !== null) {
                        perTask.push({
                            key: tasks[i].key,
                            estimated: estimated,
                            spent: timespent
                        });
                        totalSpentTime += timespent;
                        totalEstimatedTime += estimated;
                    }
                }

                return {
                    estimatedTotal: totalEstimatedTime,
                    spentTotal: totalSpentTime,
                    factor: (totalEstimatedTime / totalSpentTime).toFixed(2),
                    perTask: perTask,
                    numberOfTasks: perTask.length
                }
            }


            function drawTasksChart(tasksStats)
            {
                var ctx = document.getElementById("tasksChart").getContext("2d");

                var labels = tasksStats.perTask.map(function(info) {
                    return info.key;
                });
                var estimated = tasksStats.perTask.map(function(info) {
                    return info.estimated / 60 / 60;
                });
                var spent = tasksStats.perTask.map(function(info) {
                    return info.spent / 60 / 60;
                });

                var data = {
                    labels: labels,
                    datasets: [
                        {
                            label: "Estimated",
                            fillColor: "rgba(220,220,220,0.2)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(220,220,220,1)",
                            data: estimated
                        },
                        {
                            label: "Spent",
                            fillColor: "rgba(151,187,205,0.2)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(151,187,205,1)",
                            data: spent
                        }
                    ]
                };

                var tasksChart = new Chart(ctx).Line(data, {
                    showTooltips: true
                });
            }
        }]);