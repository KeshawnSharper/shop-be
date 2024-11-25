let {bcrypt,scanDB,checkGlobalUser,putDB,deleteDB} = require('./basicConfig')
const express = require('express');
const router = express.Router();
const axios  = require('axios');
let addRecommendations = async(movie) => {
    let obj = {}
    let userMovies = await scanDB("Heir-feet-users_recommended_movies",movie.userID,"userID")
    console.log("userMovies:",userMovies)
    userMovies.map(item => obj[item.id] = true)
    console.log(obj)
    axios.get(`https://api.themoviedb.org/3/movie/${movie.movie_id}/recommendations?api_key=bab5bd152949b76eccda9216965fc0f1&language=en-US&page=1`).then(async(res) => {
      res.data.results.map((result) => {
        console.log(result)
         let new_movie = {
        userID: movie.userID,
        id: `${result.id}`,
        title: result.title,
        poster_path: result.poster_path,
        vote_average: result.vote_average,
        overview: result.overview,
        recommended_movie_id: movie.id,
        release_date: result.release_date,
        runtime: result.runtime
    }
    if (obj[movie.id] !== true){
      putDB("Heir-feet-users_recommended_movies", new_movie)
    }
    else{
      console.log("hello")
    }
      });
    })
    return scanDB("Heir-feet-users_recommended_movies",movie.userID,"userID")
  }

router.get("/", async(req,res) => {
    res.status(200).json({"message":"hello"})
})
router.get('/:id', async(req, res) => {
  console.log("this test works")
    let checkedGlobalUser = checkGlobalUser({id: req.params.id},{"id":"string"})
    if (checkedGlobalUser.status === false) {
      res.status(500).json({"message":checkedGlobalUser.message})
      return
    } 
    userFound = await scanDB("Heir-feet-users",req.params.id,"id")
    console.log(userFound)
    userFound = userFound.selected_items
    console.log(userFound)
   if (userFound.length === 0) {
    res.status(500).json({"message":"User doesnt exist"})
    return
   }

    let savedAWSMovies = await scanDB("Heir-feet-fav-movies",req.params.id,"userID")
  
    if (savedAWSMovies.status === false) {
      res.status(500).json({"message":savedAWSMovies.message})
      return 
    }  
     res.status(200).json({"movies":savedAWSMovies.selected_items})
     return
  // }
  })
  router.delete('/:id', async(req, res) => {
   
  
      let selectedAWSMovies = await scanDB("Heir-feet-fav-movies",req.params.id,"id")
      if (selectedAWSMovies.status === false) {
        res.status(500).json({"message":selectedAWSMovies.message})
        return 
      }  
      console.log("selected_items",selectedAWSMovies.selected_items.length)
      
      if (selectedAWSMovies.selected_items.length === 0) {
        res.status(500).json({"message":"Item doesnt exist"})
        return 
      }
      const selectedMovie = selectedAWSMovies.selected_items[0]
      console.log(selectedMovie.userID)
      await deleteDB("Heir-feet-fav-movies",req.params.id,"id")
      let movies = await scanDB("Heir-feet-fav-movies",selectedMovie.userID,"userID")

       res.status(200).json({movies:movies.selected_items})
       return
    // }
    })
  router.post('/', async (req, res) => {
    let body = req.body
    console.log()
    let checkedGlobalUser = checkGlobalUser(body,{"movie_id":"string","userID":"string","original_title":"string","genre_ids":"array","adult":"boolean","overview":"string","vote_average":"number","vote_count":"number","poster_path":"string","original_language":"string","backdrop_path":"string","release_date":"string","title":"string","video":"boolean"})
    if (checkedGlobalUser.status === false) {
      res.status(500).json({"message":checkedGlobalUser.message})
      return
    } 
    let userFound = await scanDB("Heir-feet-users",req.body.userID,"id")
    userFound = userFound.selected_items
    if (userFound.length === 0) {
    res.status(500).json({"message":"User doesnt exist"})
    return
   }

  let movieExistence = axios.get(`https://api.themoviedb.org/3/movie/${body.movie_id}?api_key=bab5bd152949b76eccda9216965fc0f1&language=en-US`).then(movie => {
       let movieExist = false
       if (movie.data.status_code !== 6){
           
        movieExist = true
       }
       return movieExist
   })
   .catch(err => {
    return false
   })
   

   if (await movieExistence === false) {
    res.status(500).json({"message":"Movie does not exist"})
    return
   }
    let items = await scanDB("Heir-feet-fav-movies",body.userID,"userID")
     
    if (items.selected_items.filter(item => item.movie_id === body.movie_id).length > 0) {
      res.status(500).json({"message":"Movie already saved for this user"})
      return
    }
    else{
    body.id = `${items.total_items.length + 1}`
    
    
    await putDB("Heir-feet-fav-movies",body)
    // let recommendations = await addRecommendations(body)
    console.log("body",body)
    let movies = await scanDB("Heir-feet-fav-movies",body.userID,"userID")
    res.status(200).json({movies:movies.selected_items})
    
  }
  })
  module.exports = router;