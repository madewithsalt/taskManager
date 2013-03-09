var TM = TM || {};

TM.SeedData = {
    "tm-taskList": [
      {
        "id": "785420182",
        "name": "Kristi",
        "group": "developers"
      },
      {
        "id": "489676733",
        "name": "George",
        "group": "designers"
      }
    ],

    "tm-tasks": [
      {
        "id": "456068173",
        "title": "One",
        "date": new Date(),
        "color": "black",
        "complete": false,
        "owner" : "785420182",
        "parent_id": null
      },
      {
        "id": "451356373",
        "title": "Two",
        "date": new Date(),
        "color": "black",
        "complete": false,
        "owner" : "489676733",
        "parent_id": null
      },
      {
        "id": "45235173",
        "title": "Three",
        "date": new Date(),
        "color": "black",
        "complete": false,
        "owner" : "785420182",
        "parent_id": null
      },
      {
        "id": "456458173",
        "title": "Four - child of One",
        "date": new Date(),
        "color": "red",
        "complete": false,
        "owner" : "785420182",
        "parent_id": "456068173"
      },
      {
        "id": "416068179",
        "title": "Five - child of Four",
        "date": new Date(),
        "color": "black",
        "complete": false,
        "owner" : "785420182",
        "parent_id": "456458173"
      },
      {
        "id": "4112346179",
        "title": "Six - child of Four",
        "date": new Date(),
        "color": "black",
        "complete": false,
        "owner" : "785420182",
        "parent_id": "456458173"
      },
      {
        "id": "411212358179",
        "title": "Seven - child of Six",
        "date": new Date(),
        "color": "black",
        "complete": false,
        "owner" : "785420182",
        "parent_id": "4112346179"
      }
    ]

};

// for debug: console-level means to clear app data.
TM.clearData = function() {
  localStorage.removeItem('tm-tasks');
  localStorage.removeItem('tm-taskList');

  console.log('localStorage cleared.');
};

TM.loadSeedData = function () {

    var taskListData = localStorage.getItem('tm-taskList')
      , taskData = localStorage.getItem('tm-tasks');

      // Fill with seed data for dev if we haven't already
      if(!taskListData && !taskData) {
          var taskListSeed = JSON.stringify(TM.SeedData['tm-taskList'])
            , taskSeed = JSON.stringify(TM.SeedData['tm-tasks']);
          localStorage.setItem('tm-taskList', taskListSeed);
          localStorage.setItem('tm-tasks', taskSeed);
      }
};

var manager;

describe('Task Manager Data Management', function(){

  beforeEach(function() {
      TM.loadSeedData();

      manager = new TM.TaskManager();

  });

  afterEach(function() {
      TM.clearData();
  });

  it('Ensures Manager was created on init.', function() {
      expect(typeof(manager)).toEqual('object');
      expect(manager.tasks.length).toBeGreaterThan(0);
  });

  it('Task ID in model is same as Task ID in data object', function() {
      var data = {
            "title": "Test Task entry",
            "date": new Date('2/15/13 9:30 AM'),
            "color": "black",
            "complete": false,
            "parent_id": null
          }
        , taskListId = "785420182"
        , taskObj = manager.createTask(taskListId)
        , taskData;
  });


});