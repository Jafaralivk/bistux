const express = require("express");
const bodyparser = require("body-parser");
const sqlite3 = require("sqlite3");

const app = express();
app.use(bodyparser.json());

const db = new sqlite3.Database("./bistux.db", (err: any) => {
  if (err) {
    console.error("Erro opening database " + err.message);
  } else {
    db.run(
      "CREATE TABLE posts( \
            post_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            title NVARCHAR(20)  NOT NULL,\
            body NVARCHAR(200)  NOT NULL,\
            category NVARCHAR(20)\
        )",
      (err: any) => {
        if (err) {
          console.log("Table already exists.");
        }
      }
    );
  }
});

//Post Blogs
app.post("/blog_posts/", (req : any, res : any, next : any) => {
  db.run(
    `INSERT INTO posts (title, body, category) VALUES (?,?,?)`,
    [req.body.title, req.body.body, req.body.category],
    function (err : any, result : any) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json({
        success: true,
        "post_id": res.post_id,
        message: "Successfully Added",
      });
    }
  );
});

//Get Using pagination
app.get("/blog_posts", (req : any, res: any) => {
  const { page = 2, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  db.all(
    "SELECT * FROM posts LIMIT ? OFFSET ?",
    [limit, offset],
    (err : any, rows : any) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(200).json({ rows, currentPage: page, limit: limit });
    }
  );
  //.limit(limit * 1)
  //.skip((page - 0) * limit);
});

app.get("/all_post", (req : any, res : any, next : any) => {
  db.all("SELECT * FROM posts", [], (err : any, rows : any) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(200).json({ rows });
  });
});

// A) Return an array of all the words in the post body starting letter a or A
// B) Replace the last 3 letters of all the words starting with letter a or A with *
app.get("/blog_posts/:id/", (req : any, res : any, next : any) => {
  db.get(
    `SELECT * FROM posts where post_id = ?`, // body like '%Aa'
    [req.params.id],
    (err: any, row : any) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      try {
        const result = row.body.match(/(\bA\S+\b)/gi);
        let post_aary : any = [];
        let sort_array : any = [];
        var str = "";
        console.log(row.body);
        let j = 0;
        const sorted = row.body.replace(/(\bA\S+\b)/gi, "*");

        result.forEach((element : any) => {
          post_aary.push(element.slice(0, -3) + "***");
        });

        for (var i = 0; i < sorted.length; i++) {
          if (sorted[i] == "*") {
            sort_array.push(post_aary[j]);
            j++;
          } else {
            sort_array.push(sorted[i]);
          }
        }
        sort_array.forEach((element: any) => {
          str = str + element;
        });
        console.log(str);

        // result2 = row.body.split();
        // result2.forEach((element) => {
        //     resultt = row.body.match(/(\bA\S+\b)/gi);
        //     resultt.forEach((element1) => {
        //         // console.log(elemen1.slice(0, -3) + '***');
        //         console.log(resultt)
        //         star = element1.slice(0, -3) + '***';
        //         // element1 = element.replace(element1,star)
        //         console.log(star)
        //         console.log(element.replace(element1,star));
        //         post_aary.push(element.replace(element1,star))
        //     });
        // });
        db.run(
          "UPDATE posts SET body = ? WHERE post_id = ?",
          [str,req.params.id],
          (err: any, row :any) => {
            if (err) {
              res.status(400).json({ error: err.message });
              return;
            }
          }
        );
        res.status(200).json(result);
      } catch (e : any) {
        res.status(400).json({ error: e.message });
      }
    }
  );
});
//

// app.patch("/blog_posts/:id", (req, res, next) => {
//   db.get(
//     `SELECT * FROM posts where post_id = ?`, // body like '%Aa'
//     [req.params.id],
//     (err, row) => {
//       if (err) {
//         res.status(400).json({ error: err.message });
//         return;
//       }
//       try {
//         result = row.body.match(/(\bA\S+\b)/gi);
//         console.log(result);
//         db.run(
//           `UPDATE posts set body = '**' WHERE post_id = ?`,
//           [req.params.id],
//           (err, row) => {
//             if (err) {
//               res.status(400).json({ error: err.message });
//               return;
//             }
//           }
//         );
//         res.status(200).json(result);
//       } catch (e) {
//         res.status(400).json({ error: e.message });
//       }
//     }
//   );
// });

app.listen(3001, () => {
  console.log("Server started");
});
