const router = require("express").Router();
const axios = require("axios");
const auth = require("../auth");

const methods = {
  async onGeocode(req, res) {
    try {
      const { address } = req.query;
      const apiKey = (process.env.GOOGLE_MAP_API_KEY || process.env.REACT_APP_MAP_API_KEY || "").trim();
      if (!address || !apiKey) {
        return res.status(400).json({
          success: false,
          message: !apiKey ? "ไม่พบ API Key สำหรับแผนที่" : "กรุณาระบุ address",
        });
      }
      const { data } = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: { address, key: apiKey },
          timeout: 10000,
        }
      );
      if (data.status !== "OK" || !data.results?.length) {
        return res.success({
          success: true,
          results: [],
          message: "ไม่พบตำแหน่ง",
        });
      }
      return res.success({
        success: true,
        results: data.results,
      });
    } catch (error) {
      return res.error(error);
    }
  },
};

router.get("/", auth.required, methods.onGeocode);

module.exports = router;
