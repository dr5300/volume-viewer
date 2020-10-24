
exports.getSelectProject = async (req, res) => {
    try {
        res.status(200).render('index', {
            title: 'New project'
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed to get index html',
            message: err
        });
    }
};


