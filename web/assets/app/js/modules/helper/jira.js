angular.module('helper')
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
            'QA: Test cases': 'tc',
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
                                if (subTask.status.name == 'In Progress') {
                                    issueState.doc = 2;
                                } else {
                                    if (subTask.status.name == 'Resolved' || subTask.status.name == 'Feedback required') {
                                        issueState.doc = 1;
                                    }
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

                    this.defineIssueStatus(issueState);
                    if (issueState.status == 'Open' && issue.status.name == 'In Progress') {
                        issueState.status = issue.status.name;
                    }
                } else {
                    issueState.status = issue.status.name;
                }

                return issueState;
            },
            defineIssueStatus: function(issueState) {
                if (issueState.impl == 0) {
                    if (issueState.doc == -1 || issueState.doc == 0) {
                        issueState.status = 'Open';
                    } else if (issueState.doc == 1 || issueState.doc == 2) {
                        issueState.status = 'In Progress';
                    }
                } else if (issueState.impl == 2) {
                    issueState.status = 'In Progress';
                } else if (issueState.impl == 1) {
                    if (issueState.doc == 0 || issueState.doc == 2) {
                        issueState.status = 'Doc';
                    } else if (issueState.tbd == 0 || issueState.tbd == 2) {
                        issueState.status = 'In TBD';
                    } else if (issueState.qa == 0 || issueState.qa == 2) {
                        issueState.status = 'In QA';
                    } else if (issueState.cr == 0 || issueState.cr == 2 || issueState.tc == 0 || issueState.tc == 2) {
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
                        if (subTask.assignee && 'name' in subTask.assignee) {
                            var type = getSubTaskType(subTask);
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
                            return false;
                        }
                    }
                    return true;
                }

                return assignees;
            },
            getDetailedIssueTimeInfo: function(issue) {

                // var crEstimate = 0; // CR estimate is not fixed per issue.

                var info = {
                    estimated: { inv: 0, dev: 0, doc: 0, tbd: 0, qa: 0, cr: 0 },
                    spent:     { inv: 0, dev: 0, doc: 0, tbd: 0, qa: 0, cr: 0 },
                    overspent: { inv: 0, dev: 0, doc: 0, tbd: 0, qa: 0, cr: 0 },
                    remaining: { inv: 0, dev: 0, doc: 0, tbd: 0, qa: 0, cr: 0 }
                };

                if (issue && issue.subtasks) {
                    for (var i = 0; i < issue.subtasks.length; i++) {
                        var subTask = issue.subtasks[i];
                        if (!subTask.time) {
                            continue;
                        }
                        var subTaskType = getSubTaskType(subTask);
                        switch (subTaskType) {
                            case 'dev':
                            case 'inv':
                            case 'doc':
                            case 'tbd':
                            case 'qa':
                                info.estimated[subTaskType] += subTask.time.aggr.estimated;
                                info.spent[subTaskType] += subTask.time.aggr.spent;
                                info.remaining[subTaskType] += subTask.time.aggr.remaining;
                                info.overspent[subTaskType] += subTask.time.aggr.spent
                                    - subTask.time.aggr.estimated
                                    + subTask.time.aggr.remaining;
                                break;
                            case 'cr':
                                info.spent[subTaskType] += subTask.time.aggr.spent;
                                /*
                                 * The CR estimates are not fixed, thus it is hard to calculate
                                 *  the remaining time or the overspent. We could only provide info on spent time.
                                 *  The TL could use this info and compare it with the amount of days
                                 *  since the start of the iteration.
                                 *
                                info.estimated[subTaskType] += crEstimate;
                                var crIsResolved = (subTask.status.name == 'Resolved'
                                    || subTask.status.name == 'Closed');
                                if (subTask.time.aggr.spent > crEstimate ||
                                    (subTask.time.aggr.spent < crEstimate && crIsResolved)) {
                                    info.overspent[subTaskType] += subTask.time.aggr.spent - crEstimate;
                                }
                                */
                                break;
                        }
                    }
                }
                this.calculateTotal(info);
                return info;
            },
            calculateTotal: function(timeInfo)
            {
                for (var section in timeInfo) {
                    if (timeInfo.hasOwnProperty(section)) {
                        timeInfo[section].total = 0;
                        for (var issueType in timeInfo[section]) {
                            if (timeInfo[section].hasOwnProperty(issueType)) {
                                // Code Reviews are not accounted into the totals
                                //  as the estimates are not fixed per issue.
                                if (issueType == 'dev'
                                    || issueType == 'doc'
                                    || issueType == 'tbd'
                                    || issueType == 'qa') {
                                    timeInfo[section].total += timeInfo[section][issueType];
                                }
                            }
                        }
                    }
                }
            }
        };
    }]);