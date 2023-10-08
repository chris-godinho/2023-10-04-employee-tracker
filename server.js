// Add libraries
const express = require('express');
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

// Initialize express.js
const PORT = process.env.PORT || 3001;
const app = express();

// Declare variables for logo and question prompt
const introLogo = `


███████╗███╗   ███╗██████╗ ██╗      ██████╗ ██╗   ██╗███████╗███████╗
██╔════╝████╗ ████║██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██╔════╝██╔════╝
█████╗  ██╔████╔██║██████╔╝██║     ██║   ██║ ╚████╔╝ █████╗  █████╗  
██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██╔══╝  ██╔══╝  
███████╗██║ ╚═╝ ██║██║     ███████╗╚██████╔╝   ██║   ███████╗███████╗
╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝
                                                                     
███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗        
████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗       
██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝       
██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗       
██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║       
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝       
                                                                     

`;
const questionPrompt = 'What would you like to do?';

// Process chosen option
async function processCommand(userResponse, db) {
  switch(userResponse.userChoice) {
    case 'View all Departments':
      const [departmentRows] = await db.query('SELECT * FROM department');
      console.table(departmentRows);
      break;
    case 'View all Roles':
      const [roleRows] = await db.query('SELECT roles.id, roles.title, department.name AS department, roles.salary FROM roles INNER JOIN department ON roles.department_id = department.id ORDER BY roles.id');
      console.table(roleRows);
      break;
    case 'View all Employees':
      const [employeeRows] = await db.query('SELECT employee1.id, employee1.first_name, employee1.last_name, roles.title, department.name AS department, roles.salary, CONCAT (employee2.first_name, " ", employee2.last_name) AS manager FROM employee AS employee1 INNER JOIN roles ON employee1.roles_id = roles.id INNER JOIN department ON roles.department_id = department.id LEFT JOIN employee AS employee2 ON employee1.manager_id = employee2.id ORDER BY employee1.id');
      console.table(employeeRows);
      break;
    case 'Add a Department':
      const departmentResponse = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the department?',
      });
      await db.query('INSERT INTO department (name) VALUES (?)', departmentResponse.name);
      console.log(`Added ${departmentResponse.name} to the database.`);
      break;
    case 'Add a Role':
      const [departmentList] = await db.query('SELECT * FROM department');
      const departmentOptions = departmentList.map(department => department.name);
      const roleResponse = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'What is the name of the role?',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the role?',
      },
      {
        type: 'list',
        name: 'department',
        message: 'What department does the role belong to?',
        choices: departmentOptions,
      }]);
      await db.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [roleResponse.name, roleResponse.salary, departmentOptions.indexOf(roleResponse.department) + 1]);
      console.log(`Added ${roleResponse.name} to the database.`);
      break;
    case 'Add an Employee':
      const [roleList] = await db.query('SELECT * FROM roles');
      const roleOptions = roleList.map(role => role.title);
      const [managerList] = await db.query('SELECT CONCAT (employee.first_name, " ", employee.last_name) AS full_name FROM employee');
      const managerOptions = managerList.map(manager => manager.full_name);
      const employeeResponse = await inquirer.prompt([{
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
      },
      {
        type: 'list',
        name: 'role',
        message: "What is the employee's role?",
        choices: roleOptions,
      },
      {
        type: 'list',
        name: 'manager',
        message: "Who is the employee's manager?",
        choices: managerOptions,
      }]);
      await db.query('INSERT INTO employee (first_name, last_name, roles_id, manager_id) VALUES (?, ?, ?, ?)', [employeeResponse.firstName, employeeResponse.lastName, roleOptions.indexOf(employeeResponse.role) + 1, managerOptions.indexOf(employeeResponse.manager) + 1]);
      console.log(`Added ${employeeResponse.firstName} ${employeeResponse.lastName} to the database.`);
      break;
    case 'Update Employee Role':
      const [employeeList] = await db.query('SELECT CONCAT (employee.first_name, " ", employee.last_name) AS full_name FROM employee');
      const employeeOptions = employeeList.map(employee => employee.full_name);
      const [newRoleList] = await db.query('SELECT * FROM roles');
      const newRoleOptions = newRoleList.map(role => role.title);
      const updateResponse = await inquirer.prompt([{
        type: 'list',
        name: 'employee',
        message: "Which employee's role do you want to update?",
        choices: employeeOptions,
      },
      {
        type: 'list',
        name: 'newRole',
        message: "Which role do you want to assign the selected employee?",
        choices: newRoleOptions,
      }]);
      await db.query('UPDATE employee SET roles_id = ? WHERE id = ?', [newRoleOptions.indexOf(updateResponse.newRole) + 1, employeeOptions.indexOf(updateResponse.employee) + 1]);
      console.log(`Updated ${updateResponse.employee}'s role.`);
      break;
    default:
      quitApplication = true;
      process.exit();
  }
}

// Menu function
async function mainMenu() {
  let quitApplication = false;
  let userResponse;
  // Open MySQL connection
  const db = await mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'Placeholder2023!',
      database: 'employee_manager_db'
    }
    );
  // Clear screen
  console.clear();
  console.log(introLogo);
  // Main menu loop
  while(!quitApplication) {
    userResponse = await inquirer.prompt({
      type: 'list',
      name: 'userChoice',
      message: questionPrompt,
      choices: [
        'View all Departments',
        'View all Roles',
        'View all Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update Employee Role',
        'Quit'
      ]
    });
    await processCommand(userResponse, db);
  }
  db.end();
}

mainMenu();

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
