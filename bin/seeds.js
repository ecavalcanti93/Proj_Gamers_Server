const mongoose = require('mongoose');
const Game = require("../models/Game.model");

const MONGO_URI =   process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Proj_Gamers_Server";

const gamesSeed = [
  {
      title: "Cybernetic Odyssey",
      genre: "Sci-Fi Action RPG",
      company: "NeoTech Games",
      platform: "PS5, Xbox Series X/S, PC",
      rating: 9.2,
      age: 16,
      description: "Embarque em uma jornada épica através de uma paisagem futurista enquanto luta contra hordas de ciborgues e desvenda segredos tecnológicos perdidos."
  },
  {
      title: "Shadow Realms",
      genre: "Fantasy Adventure",
      company: "Mystic Studios",
      platform: "PS4, PC",
      rating: 8.7,
      age: 12,
      description: "Explore um mundo de fantasia sombria, cheio de magia e mistérios antigos. Descubra segredos e forje seu destino enquanto enfrenta criaturas das trevas."
  },
  {
      title: "Galactic Warfare",
      genre: "Space Shooter",
      company: "StarForge Entertainment",
      platform: "Nintendo Switch, PC",
      rating: 8.5,
      age: 10,
      description: "Pilote naves espaciais altamente personalizáveis e entre em batalhas épicas contra alienígenas invasores. Defenda a galáxia em emocionantes combates no espaço sideral."
  },
  {
      title: "Forgotten Realms: Legends of the Arcane",
      genre: "Action-Adventure",
      company: "Mythic Realm Studios",
      platform: "PS5, Xbox Series X/S, PC",
      rating: 9.5,
      age: 18,
      description: "Explore um mundo de magia e intriga, onde cada escolha molda seu destino. Desvende segredos ancestrais e lute contra criaturas lendárias em busca de poder e redenção."
  },
  {
      title: "Apex Champions",
      genre: "Battle Royale",
      company: "Thunderstrike Games",
      platform: "PS4, Xbox One, PC",
      rating: 9.0,
      age: 13,
      description: "Entre na arena como um dos lendários campeões e lute pela supremacia em intensos confrontos de equipe. Domine habilidades únicas e torne-se o último sobrevivente."
  },
  {
      title: "Time Rift Chronicles",
      genre: "Time-Traveling Puzzle",
      company: "Temporal Dynamics",
      platform: "PC, VR",
      rating: 8.8,
      age: 10,
      description: "Manipule o tempo e resolva quebra-cabeças desafiadores enquanto viaja por épocas históricas. Descubra segredos perdidos e desvende os mistérios do universo."
  },
  {
      title: "Renegade Tactics",
      genre: "Tactical Espionage",
      company: "StealthWorks",
      platform: "PS5, Xbox Series X/S, PC",
      rating: 8.9,
      age: 17,
      description: "Embarque em missões secretas em locais exóticos ao redor do mundo. Utilize táticas furtivas e tecnologia de ponta para infiltrar-se em instalações de alto risco e desvendar conspirações globais."
  },
  {
      title: "Legends of Eternia",
      genre: "MMORPG",
      company: "Eternal Realms Interactive",
      platform: "PC",
      rating: 9.3,
      age: 13,
      description: "Junte-se a milhares de jogadores em um vasto mundo online cheio de aventura e perigo. Crie seu próprio herói, forme alianças e lute contra ameaças épicas em busca de glória eterna."
  },
  {
      title: "Elemental Conquest",
      genre: "Strategy RPG",
      company: "Elemental Entertainment",
      platform: "Nintendo Switch, PC",
      rating: 8.6,
      age: 12,
      description: "Domine os elementos e comande exércitos em batalhas estratégicas pelo controle do reino. Use magia poderosa e táticas inteligentes para superar seus adversários e conquistar a terra."
  },
  {
      title: "Neon Nights",
      genre: "Retro Arcade",
      company: "RetroRevive Studios",
      platform: "PS4, Xbox One, PC",
      rating: 8.4,
      age: 8,
      description: "Reviva a era dos fliperamas com gráficos vibrantes e ação frenética. Enfrente desafios eletrizantes em uma cidade futurista enquanto compete pela pontuação mais alta."
  }
];

mongoose
  .connect(MONGO_URI)

  .then(x => {
    console.log(`Connected to Mongo database: "${x.connections[0].name}"`);
  }).then( () => {
    return Game.deleteMany();
  }).then( () => {
    // Create new documents in the books collection
    return Game.create(gamesSeed);
  })
  .then(gameFromDB => {
    console.log(`Created ${gameFromDB.length}`);

    // Once the documents are created, close the DB connection
    return mongoose.connection.close();
  })
  .then(() => {
    // Once the DB connection is closed, print a message
    console.log('DB connection closed!');
  })
  .catch(err => {
    console.log(`An error occurred while creating books from the DB: ${err}`);
  });