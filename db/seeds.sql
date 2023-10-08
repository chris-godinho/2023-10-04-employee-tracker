INSERT INTO department (name)
VALUES ("Dispatch"),
       ("Warehouse"),
       ("Cartage"),
       ("Human Resources"),
       ("Customer Service"),
       ("Headquarters");

INSERT INTO roles (title, salary, department_id)
VALUES ("Material Handler", "34000", 2),
       ("PIT Operator", "44000", 2),
       ("Team Lead", "53000", 2),
       ("Junior Manager", "85000", 6),
       ("Driver", "51000", 3),
       ("Senior Specialist", "38000", 1),
       ("Specialist", "32000", 1),
       ("Consultant", "58000", 4),
       ("CS Representative", "30000", 5),
       ("Senior Manager", "125000", 6);

INSERT INTO employee (first_name, last_name, roles_id, manager_id)
VALUES ("Chester", "Arthur", 10, NULL),
       ("Zachary", "Taylor", 4, 1),
       ("Mammonhan", "Singh", 3, 2),
       ("Benhazir", "Bhutto", 1, 2),
       ("Jacinda", "Ardern", 2, 2),
       ("Dilma", "Rousseff", 4, 1),
       ("James", "Garfield", 7, 6),
       ("Kim", "Campbell", 6, 6),
       ("Lula", "Silva", 5, 2),
       ("James", "Polk", 8, 1),
       ("Deng", "Xiaoping", 9, 6);