angular.module('helper', [])
    .factory('Helper', [function() {
        return {
            setAlert: function($scope, type, message) {
                $scope.alert = {
                    type: type,
                    message: message
                };
            }
        };
    }])
    .factory('JiraHelper', [function() {

        var subTaskTypeMap = {
            'Backend Development': 'dev',
            'Frontend Development': 'dev',
            'Integration Development': 'dev',
            'System Administration': 'dev',
            'Investigate': 'inv',
            'Code Review': 'cr',
            'Documentation': 'doc',
            'Testing by Developer': 'tbd',
            'QA: Test Cases': 'tc',
            'QA: Testing': 'qa',
            'QA: Performace': 'perf'
        };
        function getSubTaskType(subTask)
        {
            var customType = subTask.issuetype.custom || subTask.summary;
            return subTaskTypeMap[customType] || 'dev';
        }

        return {
            getIssueState: function(issue) {
                /**
                 * Values:
                 *     -1 means that item does not exist.
                 *      0 means item is open or not resolved
                 *      1 means item is resolved
                 *      2 means item is in progress
                 */
                var issueState = {
                    status: null,
                    impl: 0,
                    doc: -1,
                    tbd: -1,
                    tc: -1,
                    qa: -1,
                    qa_assigned: 0,
                    cr: -1
                };
                var devIssuesOpened = 0;
                var devIssuesInProgress = 0;
                var devIssuesResolved = 0;

                // todo: consider "Feedback required" && "Feedback available"
                if (issue.subtasks && issue.subtasks.length) {
                    for (var i = 0; i < issue.subtasks.length; i++) {
                        var subTask = issue.subtasks[i];
                        switch (getSubTaskType(subTask)) {
                            case 'dev':
                            case 'inv':
                                if (subTask.status.name == 'In Progress') {
                                    devIssuesInProgress++;
                                }
                                if (subTask.status.name == 'Open' || subTask.status.name == 'Reopened') {
                                    devIssuesOpened++;
                                }
                                if (subTask.status.name == 'Resolved') {
                                    devIssuesResolved++;
                                }
                                break;
                            case 'cr':
                                issueState.cr = 0;
                                if (subTask.status.name == 'Resolved') {
                                    issueState.cr = 1;
                                }
                                break;
                            case 'doc':
                                issueState.doc = 0;
                                if (subTask.status.name == 'Resolved' || subTask.status.name == 'Feedback required') {
                                    issueState.doc = 1;
                                }
                                break;
                            case 'tbd':
                                issueState.tbd = 0;
                                if (subTask.status.name == 'Resolved') {
                                    issueState.tbd = 1;
                                }
                                break;
                            case 'tc':
                                issueState.tc = 0;
                                if (subTask.status.name == 'Resolved') {
                                    issueState.tc = 1;
                                }
                                break;
                            case 'qa':
                                issueState.qa = 0;
                                if (subTask.status.name == 'Resolved') {
                                    issueState.qa = 1;
                                }
                                if (subTask.assignee.key != 'chuck.norris') {
                                    issueState.qa_assigned = 1
                                }
                                break;
                        }
                    }

                    if (devIssuesInProgress || (devIssuesOpened && devIssuesResolved)) {
                        issueState.impl = 2;
                    } else if (!devIssuesOpened && !devIssuesInProgress /* && devIssuesResolved*/) {
                        issueState.impl = 1;
                    }
                }

                this.defineIssueStatus(issueState);

                return issueState;
            },
            defineIssueStatus: function(issueState) {
                if (issueState.impl == 0) {
                    issueState.status = 'Open';
                } else if (issueState.impl == 2) {
                    issueState.status = 'In Progress';
                } else if (issueState.impl == 1) {
                    if (issueState.doc == 0) {
                        issueState.status = 'Doc';
                    } else if (issueState.tbd == 0) {
                        issueState.status = 'In TBD';
                    } else if (issueState.qa == 0) {
                        issueState.status = 'In QA';
                    } else if (issueState.cr == 0 || issueState.tc == 0) {
                        issueState.status = 'Resolved';
                    } else {
                        issueState.status = 'Done';
                    }
                }
                return issueState;
            },
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
                        var type = getSubTaskType(subTask);
                        if (type == 'dev') {
                            var addDev = true;
                            for (var aKey = 0; aKey < assignees.devs.length; aKey++) {
                                if (assignees.devs[aKey].name == subTask.assignee.name) {
                                    addDev = false;
                                    break;
                                }
                            }
                            if (addDev) {
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

                return assignees;
            }
        };
    }]);