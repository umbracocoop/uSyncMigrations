app.requires.push('ngGrid');


app.directive('ngblur', function() {
    return function(scope, elem, attrs) {
        elem.bind('blur', function() {
            console.log('blurrrr');
            scope.$apply(attrs.ngblur);

        });
    };
});

app.directive('umbHideEditButtons', function($timeout) {
    return {
        restrict: 'EA',
        transclude: true,
        template: '<p></p>',
        link: function postLink(scope, element, attrs, controller) {

            // get all scopes
            var scopes = [];

            var tmp = scope;

            while (tmp.$parent) {
                tmp = tmp.$parent;
                scopes.push(tmp);
            }

            // revers so we can start from top-down to avoid inherited property when we search for first scope that has content property (where tabs are defined as content.tabs)
            scopes.reverse();
            var myTab = null;
            for (i = 0; i < scopes.length; i++) {
                if (angular.isDefined(scopes[i].content) && angular.isDefined(scopes[i].content.tabs)) {
                    myTab = scopes[i].content.tabs[0];
                    break;
                }
            }

            if (myTab != null) {
                var $buttonsPanel = angular.element('.umb-editor-drawer-content__right-side');
                $buttonsPanel.hide();

                angular.element('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
                    var target = $(e.target).attr("href") // activated tab
                    if (target == '#tab' + myTab.id) {
                        $buttonsPanel.hide();
                    }
                    else {
                        $buttonsPanel.show();
                    }
                });
            }
        }
    };
});


angular.module("umbraco").controller("Custom.SchoolRegistrations",
    function($scope, $timeout, $http, $rootScope) {
        $scope.status = {};

        $scope.itemsOriginal = [];
        $scope.isOriginalDirty = false;
        //$scope.cellInputEditableTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateEntity(row)" />';
        $scope.cellEditableTemplate = "<input ng-class=\"'colt' + col.index\" ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\" ng-change=\"updateEntity(row, row2)\" no-Dirty-Check/>";
        $scope.cellDateTemplate = "<div class=\"ngCellText\" ng-class=\"col.colIndex()\">{{formatDate(row.entity.Created) | date:'yyyy-MM-dd'}}</div>";
        $scope.cellActionsTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>[<a id="a_resend_{{row.entity.Id}}" href ng-click="resendConfirmationEmail(row)">Resend email</a>][<a id="a_pickup_{{row.entity.Id}}" href ng-click="sendPickupNotificationEmail(row)">Send pickup notif.</a>][<a href title="Delete" ng-click="delete(row)"><i class="icon-delete"/></a>]</span></div>';

        // Pickup notifications bulk action
        $scope.pickupNotificationTask = {};
        $scope.pickupNotificationTask.weekNumber = 43;        
        $scope.pickupNotificationTask.status = {};

        $scope.runningTasksCount = -1;        
        $scope.tasksHistory = [];

        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: true
        };
        $scope.totalServerItems = 0;

        $scope.pagingOptions = {
            pageSizes: [10, 25, 50],
            pageSize: 50,
            currentPage: 1
        };

        $scope.setPagingData = function(data, page, pageSize, totalItems) {
            $timeout(function() {
                //var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.listData = data;

                if (totalItems) {
                    $scope.totalServerItems = totalItems;
                }
                if (totalItems==0) {
                    $scope.totalServerItems = 0;
                }
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };

        $scope.getPagedDataAsync = function(pageSize, page, searchText) {
            var url = '/umbraco/surface/Schools/registrations?filter={0}&pageSize={1}&startPage={2}&t=' + new Date().getTime();
            url = url.replace('{0}', searchText || '');
            url = url.replace('{1}', pageSize);
            url = url.replace('{2}', page);


            $http.get(url).success(function(result) {
                $scope.itemsOriginal = angular.copy(result.Items);
                $scope.setPagingData(result.Items, result.CurrentPage, result.ItemsPerPage, result.TotalItems);
            });

        };

        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

        $scope.$watch('pagingOptions', function(newVal, oldVal) {
            if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.currentPage != oldVal.currentPage || newVal.pageSize != oldVal.pageSize)) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('filterOptions', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.gridOptions = {
            data: 'listData',
            enableCellSelection: true,
            enableCellEditOnFocus: true,
            enableRowSelection: false,
            enablePaging: true,
            showFooter: true,
            enableColumnResize: true,
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            totalServerItems: 'totalServerItems',
            columnDefs: [
              { field: 'Email', displayName: 'Email', enableCellEdit: true, width: 170, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'FirstName', displayName: 'First name', width: 90, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'LastName', displayName: 'Last name', width: 90, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'Phone', displayName: 'Phone', width: 80, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'SchoolName', displayName: 'School', width: 180, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'SchoolId', displayName: 'Id', width: 70, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'SchoolAddress', displayName: 'Address', width: 210, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'SchoolPostCode', displayName: 'Post nr', width: 60, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'ShopId', displayName: 'Store id', width: 70, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'ShopName', displayName: 'Store name', width: 100, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'WeekNumber', displayName: 'Week number', width: 100, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'NumberOfClasses', displayName: 'No of boxes', width: 100, editableCellTemplate: $scope.cellEditableTemplate },
              { field: 'Created', displayName: 'Created', width: 90, enableCellEdit: false, cellTemplate: $scope.cellDateTemplate },
              { field: 'TermsAndConditions', displayName: 'Terms and conditions', width: 190, enableCellEdit: false, cellTemplate: $scope.cellBoolTemplate },
              { displayName: 'Actions', width: 260, enableCellEdit: false, cellTemplate: $scope.cellActionsTemplate }
            ],
            //filterOptions: { filterText: '', useExternalFilter: false },
            useExternalSorting: false
        };

        $scope.updateEntity = function(row) {
            $scope.isOriginalDirty = !angular.equals($scope.itemsOriginal, $scope.listData);
        }

        $scope.saveChanges = function() {
            var changedRows = [];
            for (i = 0; i < $scope.itemsOriginal.length; i++) {
                if (!angular.equals($scope.itemsOriginal[i], $scope.listData[i])) {
                    changedRows.push($scope.listData[i]);
                }
            }
            if (changedRows.length > 0) {
                var url = '/umbraco/surface/Schools/registrations?' + new Date().getTime();
                $http.post(url, changedRows).then(function(result) {
                    if (result.data.Success) {
                        $scope.itemsOriginal = angular.copy($scope.listData);
                        $scope.isOriginalDirty = false;
                        $scope.setStatus(result.data.Message, 'alert alert-success');
                    }
                    else {
                        $scope.setStatus(result.data.Message, 'alert alert-error');
                    }
                },
                function(result) {
                    console.log(result);
                    $scope.setStatus('Error submitting data', 'alert alert-error');
                });
            }

        };

        $scope.truncateTable = function () {
            var really = window.confirm("Are you sure you want to delete all registrations?");
            if (!really) {
                return;
            }
            var url = '/umbraco/surface/Schools/TruncateTable?' + new Date().getTime();
                $http.post(url).then(function (result) {
                    if (result.data.Success) {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                        $scope.setStatus(result.data.Message, 'alert alert-success');
                    }
                    else {
                        $scope.setStatus(result.data.Message, 'alert alert-error');
                    }
                },
                function (result) {
                    console.log(result);
                    $scope.setStatus('Error submitting data', 'alert alert-error');
                });
           };

        $scope.setStatus = function(msg, css) {
            $scope.status = {};
            $timeout(function() {
                $scope.status = { message: msg, cssClass: css };
            }, 100);
            $timeout(function() {
                $scope.status = {};
            }, 5000);
        };

        $scope.resendConfirmationEmail = function(row) {
            console.log(row);
            //return;
            var url = '/umbraco/surface/Schools/resendconfirmationemail';
            $http.post(url, { id: row.entity.Id }).then(
              function(result) {
                  $scope.setStatus(result.data.Message, result.data.Success ? 'alert alert-success' : 'alert alert-error');
              },
              function(result) {
                  console.log(result);
                  $scope.setStatus('Error submitting data', 'alert alert-error');
              }
            );
        };

        $scope.sendPickupNotificationEmail = function(row) {
            console.log(row);
            //return;
            var url = '/umbraco/surface/Schools/SendPickupNotificationEmail';
            $http.post(url, { id: row.entity.Id }).then(
              function(result) {
                  $scope.setStatus(result.data.Message, result.data.Success ? 'alert alert-success' : 'alert alert-error');
              },
              function(result) {
                  console.log(result);
                  $scope.setStatus('Error submitting data', 'alert alert-error');
              }
            );
        };

        $scope.formatDate = function(jsonDate) {
            var date = new Date(parseInt(jsonDate.substr(6)));
            return date;
        };

        $scope.delete = function(row) {
            var really = window.confirm("Are you sure you want to delete registration for " + row.entity.Email + "?");
            if (!really) {
                return;
            }
            var url = '/umbraco/surface/Schools/Delete';
            $http.post(url, { id: row.entity.Id }).then(function(result) {
                if (result.data.Success) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                    $scope.setStatus(result.data.Message, 'alert alert-success');
                }
                else {
                    $scope.setStatus(result.data.Message, 'alert alert-error');
                }
            },
            function(result) {
                console.log(result);
                $scope.setStatus('Error submitting data', 'alert alert-error');
            });
        };


        $scope.startTaskPickupNotifications = function(liveMode) {
            if (liveMode) {
                $http.post('/umbraco/surface/Schools/GetRegistrationsCountByWeek', { weekNr: $scope.pickupNotificationTask.weekNumber }).then(function(result) {
                    if (result.data.Success) {
                        if (result.data.TotalItems == 0) {
                            alert('No registrations found for week ' + $scope.pickupNotificationTask.weekNumber + '..');
                            return;
                        }
                        if (!confirm('Are you sure you want to start sending emails to ' + result.data.TotalItems + ' registration(s) for week ' + $scope.pickupNotificationTask.weekNumber + '?')) {
                            return;
                        }
                        $http.post('/umbraco/surface/Schools/StartTaskSendPickupEmails', { weekNr: $scope.pickupNotificationTask.weekNumber, testEmail: (liveMode ? null : $scope.pickupNotificationTask.testEmail) }).then(function(result) {
                            if (result.data.Success) {
                                $scope.findPickupTask(result.data.RunningTasks);
                            }
                        });
                    }
                    else {
                        $scope.setStatus(result.data.Message, 'alert alert-error');
                    }
                });
            }
            else {
                if (!$scope.pickupNotificationTask.testEmail) {
                    $scope.setStatus("Please input a valid email", 'alert alert-error');
                    return;
                }
                $http.post('/umbraco/surface/Schools/StartTaskSendPickupEmails', { weekNr: $scope.pickupNotificationTask.weekNumber, testEmail: $scope.pickupNotificationTask.testEmail }).then(function(result) {
                    if (result.data.Success) {
                        $scope.findPickupTask(result.data.RunningTasks);
                    }
                });
            }




        }

        $scope.findPickupTask = function(list) {
            var pickupTask = _.find(list, function(x) { return x.TaskType == 1 });  // TaskType = 1 - SendPickupEmailNotificationsTask
            if (pickupTask) {
                $scope.runningTasksCount = list.length;
                $scope.runningTask = pickupTask;
            }
            else {
                $scope.runningTasksCount = 0;
                $scope.runningTask = null;
            }
        };

        $scope.resumeTaskPickupNotifications = function(id) {
            $http.post('/umbraco/surface/Schools/ResumeTaskSendPickupEmails', { taskId: id }).then(function(result) {                
                if (result.data.Success) {
                    $scope.findPickupTask(result.data.RunningTasks);
                }                
            });
        }

        $scope.removeTaskPickupNotifications = function(id) {
            $http.post('/umbraco/surface/Schools/RemoveTaskSendPickupEmails', { taskId: id }).then(function(result) {
                
                if (result.data.Success) {
                    $scope.findPickupTask(result.data.RunningTasks);
                }
            });
        }

        $scope.endTimeNotNull = function(task) {            
            return task.EndTime != null;
        };

        $scope.endTimeNull = function(task) {
            return task.EndTime == null;
        }



        $scope.getTasksStatus = function() {
            $http.get('/umbraco/surface/Schools/GetRunningTasks').then(function(result) {
                console.log('Update task list', result);
                if (result.data.Success) {
                    $scope.findPickupTask(result.data.RunningTasks);
                    
                    $scope.tasksHistory = result.data.TasksHistory;                    
                }
                else {
                    $scope.setStatus(result.data.Message, 'alert alert-error');
                }
                $timeout($scope.getTasksStatus, 3000);
            });
        };

        $timeout($scope.getTasksStatus, 1000);

    });


