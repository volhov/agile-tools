angular.module('helper')
    .factory('JiraHelper_Assignees', ['JiraHelper_TaskType',
        function(TaskType) {

            return {
                getStoryAssignees: function(issue) {
                    var assignees = {
                        devs: [issue.assignee],
                        tbd: {},
                        qa: {}
                    };
                    if (issue.subtasks && issue.subtasks.length) {
                        assignees.devs = [];
                        for (var i = 0; i < issue.subtasks.length; i++) {
                            var subTask = issue.subtasks[i];
                            if (subTask.assignee && 'name' in subTask.assignee) {
                                var type = TaskType.get(subTask);
                                if (type == 'dev' || type == 'inv') {
                                    if (!devExists(subTask.assignee)) {
                                        assignees.devs.push(subTask.assignee);
                                    }
                                }
                                if (type == 'tbd') {
                                    assignees.tbd = subTask.assignee;
                                }
                                if (type == 'qa') {
                                    assignees.qa = subTask.assignee;
                                }
                            }
                        }
                        if (!assignees.devs.length) {
                            assignees.devs.push(issue.assignee);
                        }
                    }

                    function devExists(assignee)
                    {
                        for (var aKey = 0; aKey < assignees.devs.length; aKey++) {
                            if (assignees.devs[aKey].name == assignee.name) {
                                return true;
                            }
                        }
                        return false;
                    }

                    return assignees;
                }
            }
        }]);