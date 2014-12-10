angular.module('helper')
    .factory('JiraHelper_IssueState', ['JiraHelper_TaskType', 'JiraHelper_Status',
        function(TaskType, Status) {

            var getTaskType = TaskType.get;
            var getStatusCode = Status.get;

            function defineComplexIssueState(issue, issueState)
            {
                if (!issue.subtasks) {
                    return;
                }

                var devIssues = 0;
                var devIssuesOpened = 0;
                var devIssuesInProgress = 0;
                var devIssuesResolved = 0;

                for (var i = 0; i < issue.subtasks.length; i++) {
                    var subTask = issue.subtasks[i];
                    var taskType = getTaskType(subTask);
                    switch (taskType) {
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
                            devIssues++;
                            break;
                        case 'cr':
                        case 'doc':
                        case 'tbd':
                        case 'tc':
                            issueState[taskType] = getStatusCode(subTask);
                            break;
                        case 'qa':
                            issueState.qa = getStatusCode(subTask);
                            if (subTask.assignee.key != 'chuck.norris') {
                                issueState.qa_assigned = 1
                            }
                            break;
                    }
                }

                if (devIssues) {
                    if (devIssuesInProgress || (devIssuesOpened && devIssuesResolved)) {
                        issueState.impl = 2;
                    } else if (!devIssuesOpened && !devIssuesInProgress && devIssuesResolved) {
                        issueState.impl = 1;
                    } else {
                        issueState.impl = 0;
                    }
                } else {
                    issueState.impl = -1;
                }

                aggregateIssueStatus(issueState);
            }

            function defineSimpleTaskState(issue, issueState)
            {
                if (issue.issuetype.name != 'Task'
                    && issue.issuetype.name != 'Bug Report') {
                    return;
                }
                var taskType = getTaskType(issue);
                switch (taskType) {
                    case 'dev':
                    case 'inv':
                        issueState.impl = getStatusCode(issue);
                        break;
                    case 'cr':
                    case 'doc':
                    case 'tbd':
                    case 'tc':
                    case 'qa':
                        issueState[taskType] = getStatusCode(issue);
                        break;
                }
            }

            function aggregateIssueStatus(issueState) {
                if (issueState.impl == 0) {
                    if (issueState.doc == -1 || issueState.doc == 0) {
                        issueState.status = 'Open';
                    } else if (issueState.doc == 1 || issueState.doc == 2) {
                        issueState.status = 'In Progress';
                    }
                } else if (issueState.impl == 2) {
                    issueState.status = 'In Progress';
                } else if (issueState.impl == 1 || issueState.impl == -1) {
                    if (issueState.doc == 0 || issueState.doc == 2) {
                        issueState.status = 'Doc';
                    } else if (issueState.tbd == 0 || issueState.tbd == 2) {
                        issueState.status = 'In TBD';
                    } else if (issueState.qa == 0 || issueState.qa == 2) {
                        issueState.status = 'In QA';
                    } else if (issueState.cr == 0 || issueState.cr == 2
                        || issueState.tc == 0 || issueState.tc == 2) {
                        issueState.status = 'Resolved';
                    } else {
                        issueState.status = 'Done';
                    }
                }
                return issueState;
            }

            return {
                get: function(issue) {
                    /**
                     * Values:
                     *     -1 means that item does not exist.
                     *      0 means item is open or not resolved
                     *      1 means item is resolved
                     *      2 means item is in progress
                     *      3 means item is on hold:, "on hold", feedback required or available but not accepted yet
                     */
                    var issueState = {
                        status: issue.status.name,
                        impl: -1,
                        doc: -1,
                        tbd: -1,
                        tc: -1,
                        qa: -1,
                        qa_assigned: 0,
                        cr: -1
                    };

                    if (issue.subtasks && issue.subtasks.length) {
                        defineComplexIssueState(issue, issueState);
                    } else {
                        defineSimpleTaskState(issue, issueState);
                    }

                    return issueState;
                }
            }
        }]);