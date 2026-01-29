const express = require('express');
const { prepare } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const about = await prepare('about_content').all();

    if (about && about.length > 0) {
      const data = about[0];
      res.json({
        id: data.id,
        content: data.content,
        founder_name: data.founder_name,
        founder_photo: data.founder_photo,
        owner_name: data.owner_name,
        owner_photo: data.owner_photo,
        management_name: data.management_name,
        management_photo: data.management_photo
      });
    } else {
      // Return default content if no data exists
      res.json({
        id: 1,
        content: "Flame Cloud is a next-generation gaming server hosting platform built for speed, power, and reliability.",
        founder_name: "Flame Founder",
        founder_photo: null,
        owner_name: "Flame Owner",
        owner_photo: null,
        management_name: "Flame Management",
        management_photo: null
      });
    }
  } catch (error) {
    console.error('About route error:', error);
    res.json({
      id: 1,
      content: "Flame Cloud is a next-generation gaming server hosting platform built for speed, power, and reliability.",
      founder_name: "Flame Founder",
      founder_photo: null,
      owner_name: "Flame Owner",
      owner_photo: null,
      management_name: "Flame Management",
      management_photo: null
    });
  }
});

module.exports = router;

module.exports = router;