angular.module('helper')
    .factory('JiraHelper_Time', ['JiraHelper_TaskType',
        function(TaskType) {

            function calculateTotal(timeInfo)
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

            return {
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
                            var subTaskType = TaskType.get(subTask);
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
                    calculateTotal(info);
                    return info;
                }
            }
        }]);