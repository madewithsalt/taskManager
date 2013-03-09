/*global $, localStorage, console, _, Mustache, CryptoJS, $D */
/*jshint laxcomma: true */

//*** TASKLIST APP **//
//## Required Libraries:
// - jQuery
// - UnderscoreJS
// - jQueryUI sortable
// - MustacheJS
// - cryptoJS MD5 rollup
// - Date.min.js from http://sandbox.kendsnyder.com/date/

'use strict';

var TM = window.TM = TM || {};

// ------------- APP DATA ------------- //
TM.appData = {

    dateFormat: "%a, %b %#d, %#I:%M %p" //http://sandbox.kendsnyder.com/date/#codes

  , groups: ["developers", "designers"]

  , templateUrls: {
      task: '/view/task.php'
    , taskList: '/view/tasklist.php'
    , taskListExpanded: '/view/tasklist_expanded.php'
    , taskGroup: '/view/taskgroup.php'
    , weeklyTaskList: '/view/weekly_tasklist.php'

    }

  // to be filled by TM.utils.preloadTemplates
  , templates: {}

};



// ------------- UTILITIES ------------- //
TM.utils = {
    preloadTemplates: function(callback) {
      var numLoaded = 0
        , tmplUrls = TM.appData.templateUrls
        , numTemplates = _.size(TM.appData.templateUrls)
        , templates = {}
        , checkLoaded = setInterval(function() {
            if (numLoaded === numTemplates) {
              clearInterval(checkLoaded);
              TM.appData.templates = templates;

              if(callback) {
                  console.log('loaded all templates.');
                  callback();
              }
            }
          }, 100);

      _.each(tmplUrls, function(val, key, list){
          $.ajax({
              url: val,
              success: function(resp){
                  templates[key] = resp;
                  numLoaded++;
              },
              error: function(e) {
                  console.log('load failed!: ', val);
              }
          });
      });

      // Enhancement: timeout fallback for failures,
      // or $.ajax.error breaking loop.

    }

    // credit: http://javascript.about.com/library/blweekyear.htm
  , getWeekofYear: function(date) {
        var dayInMS = 86400000
          // convert to date object if it isn't aleady
          , dateObj = new Date(date)
          , firstOfYear = new Date(dateObj.getFullYear(),0,1)
          , weekOfYear = Math.ceil(((( dateObj - firstOfYear) / 86400000) + firstOfYear.getDay()+1)/7)
          , weekDateStart = (function() {
              var dayNumber = parseFloat($D(dateObj).strftime('%w'));

              return $D(dateObj).add(- dayNumber);
            })();

        return [weekOfYear, weekDateStart];

    }

};

// --------------- DATA OBJECT ------------- //
// A Directive to manage the CRUD'dy things
// Gives us a wrapper that can swap our data sources later.
// OPTIONS:
// - type: "object" (default), "string", "array"
// -----------------------------------------
TM.Data = function(collectionName, options) {
  // first feature detect localStorage
  var hasStorage = (function(){
        try {
          localStorage.setItem('testIfExists', 'yep!');
          return true;
        } catch(e) {
          console.log(e);
          return false;
        }
      })();

  if(!hasStorage) {
      $.error('localStorage is not available, can\'t save anything! :(');
  } else {
      // we have local storage, go!
      console.log('localStorage: initalized for: ' + collectionName + '.');

      if (!collectionName) {
          $.error('TM.Data: Data Objects need a collectionName.');
      } else {
          this.collection = collectionName;
          this.type = 'object';

          // this is where we store the data while we compare/manipulate it.
          // since localStorage needs strings, this gives us an object to compile/save
          var currentData;

          if (options && options.type === 'string') {

            this.type = 'string';
            currentData = localStorage.getItem(this.collection);

          } else if (options && options.type === 'array') {

            this.type = 'array';
            currentData = localStorage.getItem(this.collection).split(',');
          } else {

            currentData = JSON.parse(localStorage.getItem(this.collection));
          }


          // Use the current known data or create an empty object.
          this.cache = currentData ? currentData : [];
      }
  }
};

TM.Data.prototype = {

    // create an MD5 id based on the date.
    createId: function() {
      var hash = CryptoJS.MD5((new Date()).getTime().toString())
        , num = Math.floor(Math.random() * (3 - 0 +1)) + 0;

      // sometimes hashes can be a negative number,
      // this always ensures we only store a positive.
      // also, we want the id value to be a string.
      if (hash.words[num] > 0) {
        return hash.words[num].toString();
      } else {
        return (hash.words[num] * -1).toString();
      }

    }

    // get: returns a single item if id is specified,
    // else returns the entire object.
  , get: function (id) {
        if (id) {
            var dataObj = _.find(this.cache, function(obj){
                  return obj.id === id;
              });

            if (dataObj) {

              return dataObj;

            } else {
              // no id found.
              console.log('get: No ID found by that name.', id);
              return false;
            }
        } else {

          return this.cache;

        }
    }

  , save: function () {
      // update the localStorage object and the cache.
      localStorage.setItem(this.collection, JSON.stringify(this.cache));
      console.log('saved new thing!');

    }

  , create: function (entry) {
        entry.id = this.createId();
        entry.date = entry.date ? entry.date : new Date();

        this.cache.push(entry);
        this.save();

        return this.get(entry.id);
    }

  , edit: function(id, settings) {
        var targetObj = _.find(this.cache, function(obj){
              return id === obj.id;
            });

        // TODO: Finish me!
        if(targetObj) {
            for (var attr in settings) {
              targetObj[attr] = settings[attr];
            }

            this.save();
            return this.get(targetObj.id);
        }
  }

  , remove: function(id) {
      var targetObj = this.get(id)
        , objIndex = null;


    }

};

TM.TaskManager = function(targetContainer) {
    var self = this
      , taskData, taskListData;


    this.$container = $(targetContainer);

    // local instance of all of the models used.
    this.taskGroup = TM.TaskGroup;
    this.taskList = TM.TaskList;
    this.task = TM.Task;

    // the data objects we get and save against.
    this.data = {
        taskLists: new TM.Data('tm-taskList')
      , tasks: new TM.Data('tm-tasks')
    };

    // collections of models by type
    this.groups = [];
    this.tasks = [];
    this.taskLists = [];

    // first, preload the templates.
    // the proceeding callback fires once all templates are loaded.
    TM.utils.preloadTemplates(initializeApp);



    // Create a listener that will update the data on any model change
    $(self).on('datachange', $.proxy(self.updateData, this));


    function initializeApp() {

      self.createModels();
      self.controller = new TM.TaskManagerController(self);

    }
};

TM.TaskManager.prototype = {
    updateData: function() {
      var self = this;
        console.log('updateData called');

        self.createModels();
        // use the reRoute check to refresh data
        // based on current URL state
        self.controller.checkReRoute(self.controller);
    }

    // this function re-creates all of the apps's data models.
  , createModels: function() {
      var self = this;

      // clean out model arrays:
      this.groups = [];
      this.tasks = [];
      this.taskLists = [];


      // create model objects for all known data.
      _.each(TM.appData.groups, function(obj) {
          // get task lists only related to this group
          var grpTaskList = _.filter(self.data.taskLists.get(), function(el) {
              return obj === el.group;
          });

          self.createTaskGroup(obj);

          // create a taskList object for each list inside this group.
          _.each(grpTaskList, function(list) {
              self.createTaskList(obj, list);
          });
      });

      // once the taskList objects are created, we can add the tasks.
      _.each(self.taskLists, function(listObj) {
          var targetTasks = _.filter(self.data.tasks.get(), function(el) {
                  return listObj.id === el.owner;
              });

          _.each(targetTasks, function(task) {
              self.createTask(listObj.id, task);
          });
      });
  }

  , getTaskGroupByName: function(groupName) {
        var taskGroup = _.find(this.groups, function(obj) {
            return obj.groupName === groupName;
        });

        return taskGroup;
    }

  , getTaskListById: function(id) {
        var taskList =  _.find(this.taskLists, function(obj) {
            return obj.id === id;
        });

        return taskList;
    }

  , getTaskById: function(id) {
        var task = _.find(this.tasks, function(obj) {
            return obj.id === id;
          });

        return task;
    }

  , getTasksByListId: function (taskListId) {
        return _.filter(this.tasks, function(obj) {
            return obj.owner === taskListId;
          });
  }

  // not associated with a data souce,
  // is created from existing data only.
  , createTaskGroup: function(groupName) {
        // make sure it doesn't already exist
        if(!this.getTaskGroupByName(groupName)) {
          var taskGroup = new this.taskGroup(groupName);
          this.groups.push(taskGroup);

          return taskGroup;

        } else {
          console.log('createTaskGroup: group already exists.');
          return false;
        }
    }

  , createTaskList: function(groupName, settings) {
      // require groupName
      if(!groupName) {
        console.log('createTaskList: group name exists.');
        return false;

      } else {
        // check if group Obj exists
        var taskList = new this.taskList(settings);
        this.taskLists.push(taskList);

        return taskList;

      }


  }


  , createTask: function(taskListId, settings) {
      var taskList = this.getTaskListById(taskListId)
        , values = {}
        , task, newTaskData;

      if(!taskList) {
        console.log('createTask: no taskList found');
        return false;

      } else {
        // add the taskList id as "owner" value.
        values.owner = taskListId;

        // merge passed settings with values
        $.extend(values, settings);

        // if this does NOT have an ID, it's a new entry.
        // and we have to save it to the database.

        // TODO: With a live db, this may need
        // to be in a callback? :(
        if(!settings.id) {
            newTaskData = this.data.tasks.create(values);
            task = new this.task(newTaskData);
            this.tasks.push(task);

            // broadcast data change
            $(this).trigger('datachange');
        } else {
          // data already knows about this item, no trigger needed.
          // TODO: check if changed.
            task = new this.task(values);
            this.tasks.push(task);

        }

        return task;

      }
  }

    // edit a single or multiple tasks with a single set of values
    // taskObj: single Task model or an array of Task models.
  , editTask: function(taskObj, settings) {
        var self = this
          , taskId;



        if(_.isArray(taskObj)){

            _.each(taskObj, function(obj) {
                doEdit(obj);
            });

        } else {
            taskObj = this.getTaskById(taskObj);
            doEdit(taskObj);
        }

        function doEdit(task) {
          console.log(task.id);

            if(settings.complete && settings.complete === 'toggle') {
                settings.complete = !task.complete;
            }

            self.data.tasks.edit(task.id, settings);
        }


      // broadcast data change when done
      $(this).trigger('datachange');
  }

};


/// ------- MODELS -------------- ///

TM.TaskGroup = function(groupName) {
  this.groupName = groupName;
};

TM.Task = function(settings) {
  var defaults = {
        "complete": false,
        "color": "black",
        "parent_id": null
      }
    , attributes = {};

    // format the date based on appData preference
    // wrap date string in Date object to convert it.
    if (settings.date) {
        settings.dateFormat = $D((new Date(settings.date))).strftime(TM.appData.dateFormat);
    } else {
        settings.dateFormat = $D((new Date())).strftime(TM.appData.dateFormat);
    }

  if (!settings.owner) {
      console.log('Create Task: missing a taskList id (owner)!');
      return false;

  } else {
      $.extend(attributes, defaults, settings);

      for (var attr in attributes) {
        this[attr] = attributes[attr];
      }
  }

};


TM.TaskList = function(settings) {
  for (var attr in settings) {
    this[attr] = settings[attr];
  }

  // console.log('tasklist create:', this);


};

// ------------- CONTROLLER ------------- //
TM.TaskManagerController = function(model) {
  this.$parentContainer = model.$container;
  this.model = model;

  // on init, decide what view to start with
  // based on the hash location.
  var self = this
    , hash = window.location.hash
    , groupId = hash.replace('#', '');




  if (hash === "") {
      // if no hash id number, render the "home" page
      self.renderAll();
  } else {
      // check if hash is a valid id from the data source
      if(self.model.data.taskLists.get(groupId)) {
        self.renderExpandedGroup(groupId);
      } else {
        // if it fails, default to "home"
        // and clear the bogus number.
        window.location.hash = "";
        self.renderAll();
      }
  }

  self.bindEvents();


  $(this.model).on('updateview', $.proxy(this.updateView, this));

};

TM.TaskManagerController.prototype = {
    updateView: function () {
        console.log('updateview called');
    }

  , renderGroup: function (groupName) {
        var groupTmpl = new TM.TaskGroupView()
          , groupNode = this.model.getTaskGroupByName(groupName);

        if(groupNode) {
            var output = groupTmpl.render(groupNode);

            this.model.$container.append(output);
        }

    }

  , renderList: function(groupName, taskList) {
        var self = this
          , listTmpl = new TM.TaskListView()
          , targetGroupNode = this.model.$container.find('#task-' + groupName);

        _.each(taskList, function(obj){
            var output = listTmpl.render(obj);

            targetGroupNode.append(output);

            self.renderTasks(taskList.id);
        });

    }

  , renderTasks: function(taskListId) {
        var self = this
          , taskTmpl = new TM.TaskView()
          , taskId = taskListId
          , tasksByList = this.model.getTasksByListId(taskId)
          , targetListNode = this.model.$container.find('#tasklist-' + taskId);

          _.each(tasksByList, function(obj){
              var $taskBlock = targetListNode.find('.tasks-block');

              $taskBlock.append(taskTmpl.render(obj));
          });

    }

    // The task should already be rendered once it is passed to
    // this function. It merely reads the parent_id and moves the
    // node under it via a nested ul/li.
  , sortSubTasks: function() {
        var self = this
          , tasksList = this.model.tasks;

        // Now that all tasks have been built, discover
        // which ones are nested under another task.
        _.each(tasksList, function(obj) {
          var $taskNode = self.model.$container.find('#task-' + obj.id)
            , $taskParent = self.model.$container.find('#task-' + obj.parent_id);

            //this task has a parent.
            if(obj.parent_id) {
                moveToSub($taskParent, $taskNode);
            }
        });

        function moveToSub($taskParent, $targetChild) {
            var $childList = $taskParent.find('.task-children:first')
              , isExpanded = $taskParent.find('.expander:first').hasClass('open');

            // show the expand/collapse buttons
            $taskParent.find('.expander:first').show();
            $childList.append($targetChild);

            if(isExpanded) {
                $childList.addClass('open');
            } else {
              $childList.addClass('closed');
            }

        }

  }

    // used in the expanded view
  , sortTasksByWeek: function(taskList) {
        var self = this
          , weeks = {};

          // for each task, determine it's week of the year using
          // the utility function that returns a week number.
          _.each(taskList, function(obj) {
                // this utility returns an array, with the week of the year
                // as well as the date of the first day that week.
                var taskWeek = TM.utils.getWeekofYear(obj.date)
                  , weekNum = taskWeek[0].toString();


                // check if we've created a "week" namespace for this yet
                // if not, create it. We save the week number in the object also,
                // in anticipation for the object to be converted into an array.
                if (!weeks[weekNum]) {

                    weeks[weekNum] = {
                        weekNumber: weekNum
                      , weekStartDate: $D(new Date(taskWeek[1])).strftime(TM.appData.dateFormat)
                      , weekTasks: []
                    };

                }
                // add this task object to that week array.
                weeks[weekNum].weekTasks.push(obj);
          });

          return _.toArray(weeks);
  }

  , renderAll: function() {
      var self = this
        , taskListData = self.model.data.taskLists.get();

      // clean house for a fresh render
      this.model.$container.empty();

      _.each(TM.appData.groups, function(group){
          var groupTaskLists = _.filter(taskListData, function(obj) {
                return obj.group === group;
              });

          self.renderGroup(group);
          self.renderList(group, groupTaskLists);

          _.each(groupTaskLists, function(taskList) {
              self.renderTasks(taskList.id);
          });

      });

      // once all the objects are built, make sure tasks
      // are sorted as they should be.
      self.sortSubTasks();

      self.bindUIEvents();
    }

  , renderExpandedGroup: function(taskListId) {
      var self = this
        , taskList = this.model.getTaskListById(taskListId)
        , tasks = this.model.getTasksByListId(taskListId)
        , expandedView = new TM.TaskListExpandedView()
        , weeklyTaskListView = new TM.WeeklyTaskListView()
        , taskView = new TM.TaskView()
        , undoneTasks = this.sortTasksByWeek(_.where(tasks, {'complete': false}))
        , doneTasks = this.sortTasksByWeek(_.where(tasks, {'complete': true}))
        , data = {
              "id": taskListId
            , "tasks_undone": undoneTasks
            , "tasks_done": doneTasks
          };

        // merge in the values from the taskList object to data
        $.extend(data, taskList);

        // clean house for a fresh render
        self.model.$container.empty();

        self.model.$container.append(expandedView.render(data, {task: taskView.template, weekly_task: weeklyTaskListView.template}));

        self.bindUIEvents();

    }

  , checkReRoute: function(self) {
      // triggered on hash change,
      // decides what view set we should render
      // based on the new information.
      var hash = window.location.hash
        , groupId = hash.replace('#', '');

      if (hash === "") {
          // if no hash id number, render the "home" page
          self.renderAll();

      } else {
          // check if hash is a valid taskList id from the data source
          if(self.model.data.taskLists.get(groupId)) {
            self.renderExpandedGroup(groupId);

          } else {
            // if it fails, default to "home"
            // and clear the bogus number.
            window.location.hash = "";
            self.renderAll();

          }
      }

      console.log(window.location.hash);
    }

  , bindEvents: function() {
        // bind everything from the parent container
        var self = this
          , events = self.events
          , $parent = this.model.$container;

        $(window).on('hashchange', function() {
          self.checkReRoute(self);
        });


        $parent.on('focus', '.new-task', function(){
            var $input = $(this)
              , ENTER = 13;
            $input.on('keydown', function(evt) {
                var key = evt.keyCode ? evt.keyCode : evt.key;

                if (key === ENTER) {
                    events.processAddTask(this, self);
                    $input.off('keydown');
                    $input.focus();
                }

            });

        });

        $parent.on('click', '.task-status', function(){
            var taskId = $(this).data('taskid').toString();
            events.toggleComplete(this, self, taskId);
        });


        $parent.on('click', '.color-option', function() {
            events.changeTaskColor(this, self);
        });


        $parent.on('click', '.expander', function() {
            events.toggleCollapse(this, self);
        });

        self.bindUIEvents();

      }

      // jQuery UI is a pain in that we have to destroy
      // and rebind when we re-render, so they're called separately.
    , bindUIEvents: function() {
        var self = this
          , events = this.events
          , $parent = this.model.$container;

        if ($parent.find('.tasks-block').data('nestedsortable')){
            $parent.find('.tasks-block').nestedSortable('destroy');
        }

        $parent.find('.tasks-block').nestedSortable({
              listType: 'ul'
            , forcePlaceholderSize: true
            , handle: '.task'
            , helper: 'clone'
            , items: 'li'
            , opacity: 0.6
            , placeholder: 'placeholder'
            , revert: 250
            , tabSize: 15
            , cursor: 'move'
            , update: function(evt, ui) {
              var sortOrder = $(this).nestedSortable('toHierarchy');
              console.log('update triggered', sortOrder);
              events.processReSort(evt, sortOrder, self);

            }
        });

    }
};

// ------------- EVENTS ------------- //
// These get very verbose, and are better organized outside of the controller.

TM.TaskManagerController.prototype.events = {
    processAddTask: function (el, controller) {
          var $inputNode = $(el)
            // seems the data object comes back as a number, let's make sure it's a string.
            , taskListId = $inputNode.data('id').toString()
            , taskListObj = controller.model.getTaskListById(taskListId)
            , values = {};

          values.title = $inputNode.val();

          controller.model.createTask(taskListId, values);

          // reset the value
          $inputNode.value = "";
    }

  , toggleComplete: function(el, controller, taskId) {
        var $el = $(el)
          , taskObj = controller.model.getTaskById(taskId)
          , childTasks = $el.closest('.task').next('.task-children').find('.task');

        controller.model.editTask(taskId, {"complete": "toggle"});

        // if a task is being marked as complete (currently false)
        // also toggle all of it's children as complete
        if(taskObj.complete === false && childTasks) {
            _.each(childTasks, function(el) {
                var id = $(el).data('taskid').toString(); // grr!

                controller.model.editTask(id, {"complete": true});

            });

        }
    }

  , processReSort: function(event, sortOrder, controller) {

      // iterate through the sortOrder object
      // and update the parent_id's as needed.
      _.each(sortOrder, function(obj) {

        // by first setting this object's parent id to null,
        // we ensure anything moved out to the top-most level gets
        // saved properly.
        controller.model.editTask(obj.id, {'parent_id': null});

        // if this item has children, all of those child
        // tasks must have their parent_id matched to this obj.id
        if(obj.children) {
          moveChildElements(obj.children, obj.id);
        }
      });


      function moveChildElements(childList, parentId) {
        _.each(childList, function(obj) {
          //console.log('moveElement: child ', $("#task-" + obj.id), 'to parent >>> ', $("#task-" + parentId));
          controller.model.editTask(obj.id, {'parent_id': parentId});

          if(obj.children) {
            moveChildElements(obj.children, obj.id);
          }
        });
      }


    }

  , processReOrder: function(event, el, controller) {
      // register task id of el before/after it
      // scrape the id's
      // call a .reOrder method on the model.
    }

  , changeTaskColor: function(el, controller) {
      var color = $(el).data('color')
        , taskId = $(el).closest('.task').data('taskid').toString();

        controller.model.editTask(taskId, {"color": color});
    }

  , toggleCollapse: function(el, controller) {
        var $el = $(el)
          , childList = $el.closest('li').find('.task-children:first')
          , taskId = $el.closest('.task').data('taskid').toString()
          , isExpanded;

        if($el.hasClass('closed')) {
            $(el, childList).removeClass('closed').addClass('open');
            isExpanded = true;
        } else {
            $(el, childList).removeClass('open').addClass('closed');
            isExpanded = false;
        }

        // _.each(taskChildren, function(el) {
        //     var taskId = $(el).data('taskid').toString();

            controller.model.editTask(taskId, {'expanded': isExpanded});
        // });

    }

};


// ------------- VIEWS ------------- //
TM.View = function(template) {
  this.template = template;
};

TM.View.prototype = {
  render: function (data, partials) {
      partials = partials || {};

      return Mustache.render(this.template, data, partials);
  }
};


TM.TaskListExpandedView = function() {
    var view = new TM.View(TM.appData.templates['taskListExpanded']);

    return view;
};

TM.TaskGroupView = function() {
    var view  = new TM.View(TM.appData.templates['taskGroup']);

    return view;
};

TM.TaskListView = function() {
  var view  = new TM.View(TM.appData.templates['taskList']);

  return view;
};

TM.WeeklyTaskListView = function() {
  var view  = new TM.View(TM.appData.templates['weeklyTaskList']);

  return view;
};

TM.TaskView = function() {
  var view = new TM.View(TM.appData.templates['task']);

  return view;
};
