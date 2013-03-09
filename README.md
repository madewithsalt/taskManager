# Task Manager Standalone App

## TODO:

- Bind events to:
    * Edit Task
        - edit settings (title, color)
    * Drag & Drop (resort) Task
    * View Expanded TaskList (A Person's Set of Tasks)
    * re-order tasks when moved on the same level

- Bonus features:
    * Hook into Browser History
    * push updates as well as pull (listen for changes in another tab)

- Tests? ;-;

## BUGS:

- .focus() on input not working as expected

## Model Structure:

There are 3 main objects at work in this app:

- Task: an individual task item
- TaskList: a name-assigned group of Tasks
- TaskGroup: a category assigned to TaskLists

There are additionally three main controlling objects that manage activity between the
views, localStorage (db), and the javascript models:

- TaskManager: the primary controller and app initializer. It combines the data storage object, and controller and carries all the getter/setter methods.

- TaskManagerController: handles all the event bindings and view rendering, as well as preprocessors to validate data before it's sent back to the model

- Data Model: A simple wrapper around localStorate that could be replaced with a legit db. ;)


## Viewing the App

It is using php files so it will need to be served thru apache.

## Clearing the local data storage

Type the following into your console:

    TM.clearData();
