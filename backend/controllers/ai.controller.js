const aiService = require('../services/ai.service');

exports.analyzeBill = async (req, res) => {
    try {
        const { image, mimeType } = req.body; // base64 string
        const result = await aiService.analyzeBill(image, mimeType);
        res.success(result);
    } catch (err) {
        res.error({ message: err.message, status: 500 });
    }
};
