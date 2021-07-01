<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: *');

require_once 'vendor/autoload.php';

use Slim\Http\Request;
use Slim\Http\Response;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

use Slim\Http\UploadedFile;

# create log channel
$log = new Logger('main');
$log->pushHandler(new StreamHandler(dirname(__FILE__) . '/logs/everything.log', Logger::DEBUG));
$log->pushHandler(new StreamHandler(dirname(__FILE__) . '/logs/errors.log', Logger::ERROR));

# database
if (strpos($_SERVER['HTTP_HOST'], "ipd24.ca") !== false) {
    // hosting on ipd24.ca
    DB::$dbName = 'cp5003_edwin'; 
    DB::$user = 'cp5003_edwin'; 
    DB::$password = 'A}602oiv(9nQ';
} else { 
    // local database
    DB::$dbName = 'rest'; 
    DB::$user = 'rest'; 
    DB::$password = 'o4cpaAVEQ@MxIymG';
    DB::$host = 'localhost';
    DB::$port = 3366;
}



# dabase error handlers
DB::$error_handler = 'db_error_handler'; // runs on mysql query errors
DB::$nonsql_error_handler = 'db_error_handler'; // runs on library errors (bad syntax, etc)

function db_error_handler($params) {
    global $log;
    // log first
    $log->error("Database error: " . $params['error']);
    if (isset($params['query'])) {
        $log->error("SQL query: " . $params['query']);
    }
    http_response_code(500);
    header('Content-type: application/json; charset=UTF-8');
    die(json_encode("500 - Internal Error"));
}

// Create and configure Slim app
$config = ['settings' => [
    'addContentLengthHeader' => false,
    'displayErrorDetails' => true
]];
$app = new \Slim\App($config);

// Fetch DI Container
$container = $app->getContainer();

# File upload directory
$container['upload_directory'] = __DIR__ . '/uploads';

//Override the default Not Found Handler before creating App
$container['notFoundHandler'] = function ($container) {
    return function ($request, $response) use ($container) {
        $response = $response->withHeader('Content-type', 'application/json; charset=UTF-8');
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode("404 - not found"));
        return $response;
    };
};
//Override the default Not Found 

#header
// set content-type globally using middleware (untested)
$app->add(function($request, $response, $next) {
    $response = $next($request, $response);
    return $response->withHeader('Content-Type', 'application/json; charset=UTF-8');
});

$app->group('/api', function () use ($app) {

    $app->get('/todos', function (Request $request, Response $response, array $args) {
        $todolist = DB::query("SELECT * FROM todos");
        $counter = DB::affectedRows();
        if($counter>0)
        {
            $response = $response->withStatus(200);
            $response->getBody()->write(json_encode($todolist, JSON_PRETTY_PRINT));
        }else
        {
            $response = $response->withStatus(404);
        }
        //echo $response;
        return $response;
    });

    $app->get('/todo/{id:[0-9]+}', function (Request $request, Response $response, array $args) {
        global $log;
        $todoid = $args['id'];
        $todo = DB::queryFirstRow("SELECT * FROM todos WHERE id=%d", $todoid);
        if($todo!=null)
        {
            $log->debug("qurey todo id: ".$todo['id']);
            //$log->debug("qurey todo task: ".$todo['task']);
            $response = $response->withStatus(200);
            $response->getBody()->write(json_encode($todo, JSON_PRETTY_PRINT));
        }else
        {
            $response = $response->withStatus(404);
        }
        //echo $response;
        return $response;
    });

    $app->map(['PUT','PATCH'], '/todo/{id}', function (Request $request, Response $response, array $args) {
        global $log;
        $todoid = $args['id'];
        $json = $request->getBody();
        $item = json_decode($json, TRUE);// true makes it return an associative array instead of an object
        //DB::query("UPDATE todos SET status=%s WHERE id=%d", $item["status"], $todoid);
        $log->debug("item id: ".$todoid);
        DB::update('todos', $item, "id=%i", $todoid);
        $counter = DB::affectedRows();
        if($counter>0)
        {
            $response = $response->withStatus(200);
            $todo = DB::query("SELECT * FROM todos WHERE id=%d", $todoid);
            $response->getBody()->write(json_encode($todo, JSON_PRETTY_PRINT));
        }else
        {
            $log->debug("Affected Row of Update: ".$counter);
            $response = $response->withStatus(404);
        }
        //echo $response;
        return $response;
    });

    $app->post('/add', function (Request $request, Response $response, array $args) 
    {
        global $log;
        $json = $request->getBody();
        $item = json_decode($json, TRUE);// true makes it return an associative array instead of an object
        $result = validateTodo($item);
        $log->debug("validate result: " . $result);
        $log->debug("result!=true: " . ($result!=TRUE));
        if($result !== TRUE)
        {
            $response = $response->withStatus(400);
            $response->getBody()->write(json_encode("400 - ".$result));
            return $response;
        }
        DB::insert('todos', $item);
        $insertId = DB::insertId();
        $log->debug("Record users added id=" . $insertId);
        $response = $response->withStatus(201);
        $response->getBody()->write(json_encode($insertId));
        return $response;
    });

    $app->delete('/todo/{id:[0-9]+}', function (Request $request, Response $response, array $args) {
        $todoid = $args['id'];
        DB::delete('todos', "id=%i", $todoid);
        $counter = DB::affectedRows();
        if($counter>0)
        {
            $response = $response->withStatus(200);
            $response->getBody()->write(json_encode("record is deleted"));
        }else
        {
            $response = $response->withStatus(400);
        }
        //echo $response;
        return $response;
    });
});

function validateTodo($todo){
    global $log;
    if($todo == null){
        return "Missing parameters";
    }
    if(!isset($todo['task']) || trim($todo['task']) === ''){
        return "Task is empty";
    } else if(!isset($todo['due']) || trim($todo['task']) === ''){
        return "Due date is empty";
    } else if(!isset($todo['status']) || trim($todo['task']) === ''){
        return "Status is empty";
    }

    $expectedFields = ['task','due','status'];
    $todoFields = array_keys($todo);
    $diffInvalid = array_diff($todoFields, $expectedFields);
    $diffMissing = array_diff($expectedFields, $todoFields);
    if($diffInvalid){
        return "Invalid fields: [".implode(',', $diffInvalid)."]";
    } else if($diffMissing){
        return "Missing fields: [".implode(',', $diffMissing)."]";
    }
    if(strlen($todo['task'])<1 || strlen($todo['task'])>100){
        return "Task can only be 1-100 characters";
    }

    // what if format wrong?
    $dueDate = DateTime::createFromFormat('Y-m-d', $todo['due']);
    if($dueDate===false){
        return "Due date format can only be yyyy-mm-dd";
    }
    $log->debug("dueDate: " . $dueDate->format('Y-m-d'));
    $year = date_format($dueDate,"Y");
    $log->debug("year: " . $year);
    if($year<2000 || $year>2099){
        return "Due date shall be in year of 2000 - 2099";
    }

    $todoStatus = strtolower($todo['status']);
    if(strcmp($todoStatus,"pending")!==0 && strcmp($todoStatus,"done")!==0){
        return "Status can only be pending or done";
    }
    return TRUE;
}

$app->run();