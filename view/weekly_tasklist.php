<h4 class="week-label">Tasks for week of {{weekStartDate}}</h4>
<ul class="tasks-block">
    {{#weekTasks}}
        {{>task}}
    {{/weekTasks}}
</ul>