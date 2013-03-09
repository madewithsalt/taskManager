<?php

  $connection = new MongoClient();

  $dbname = task_manager;
  $db = $connection -> $dbname;

  $collection = $db -> tasks;

?>