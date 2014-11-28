angular.module('agile.controllers')
    .controller('Performance_Bugs', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'dateFormatFilter',
        function($scope, TEMPLATES_URL, Api, Helper, dateFormatFilter) {

            $scope.template = TEMPLATES_URL + '/performance/bugs.html';

            $scope.loadingBugsStats = false;
            $scope.jql = '';
            $scope.limit = 200;

            $scope.$on('reload-stats', reloadStats);

            function reloadStats() {
                $scope.loadingBugsStats = true;
                try {
                    loadBugs().then(function() {
                        $scope.stats.bugs = analyzeBugs($scope.bugs);
                        $scope.loadingBugsStats = false;
                        drawBugsChart($scope.stats.bugs);
                    });
                } catch (e) {
                    $scope.loadingBugsStats = false;
                    Helper.setAlert('warning', e.message);
                }
            }

            function loadBugs()
            {
                if (!$scope.user) {
                    throw {
                        message: "User is not loaded yet."
                    };
                }

                var jql = 'issuetype = "Bug Report" AND status in (Resolved, Closed) ' +
                    ' AND created <= "' + dateFormatFilter('now', 'YYYY-MM-DD') + '"' + // this is to cache bugs per day
                    ' AND Teilnehmer = ' + $scope.user.key;
                if ($scope.filters.project) {
                    jql += ' AND project = ' + $scope.filters.project.key;
                }

                $scope.jql = jql;

                return Api.get('JiraIssues').get({
                    jql: jql,
                    _fields: "summary,worklog,timetracking",
                    max_result: $scope.limit
                }).then(function(bugs) {
                    $scope.bugs = bugs;
                });
            }

            function analyzeBugs(bugs)
            {
                var totalSpentTime = 0;
                //var spentPerBug = [];
                var perBug = [];
                for (var i = 0; i < bugs.length; i++) {
                    var timespent = null;

                    try {
                        for (var j = 0; j < bugs[i].fields.worklog.worklogs.length; j++) {
                            var worklog = bugs[i].fields.worklog.worklogs[j];
                            if (worklog.author.name == $scope.user.key) {
                                timespent += worklog.timeSpentSeconds;
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    if (timespent !== null) {
                        //spentPerBug.push(timespent);
                        perBug.push({
                            key: bugs[i].key,
                            spent: timespent
                        });
                        totalSpentTime += timespent;
                    }
                }

                var spentPerBug = perBug.map(function(info) { return info.spent });

                return {
                    perBug: perBug,
                    spentTotal: totalSpentTime,
                    spentAverage: (totalSpentTime / spentPerBug.length).toFixed(2),
                    spentMin: Math.min.apply(this, spentPerBug),
                    spentMax: Math.max.apply(this, spentPerBug),
                    numberOfBugs: spentPerBug.length
                }
            }

            function drawBugsChart(bugsStats)
            {
                var ctx = document.getElementById("bugsChart").getContext("2d");

                var labels = bugsStats.perBug.map(function(info) {
                    return info.key;
                });
                var spent = bugsStats.perBug.map(function(info) {
                    return info.spent / 60 / 60;
                });

                var data = {
                    labels: labels,
                    datasets: [
                        {
                            fillColor: "#fff",
                            strokeColor: "#fff",
                            pointColor: "#f00",
                            pointStrokeColor: "#f00",
                            pointHighlightFill: "#f00",
                            pointHighlightStroke: "rgba(151,187,205,1)",
                            data: spent
                        }
                    ]
                };

                var bugsChart = new Chart(ctx).Line(data, {
                    responsive: true,
                    pointDotRadius: 0.5,
                    bezierCurve: false,
                    datasetStroke: false,
                    datasetStrokeWidth: 0,
                    datasetFill: false
                });
            }

        }]);