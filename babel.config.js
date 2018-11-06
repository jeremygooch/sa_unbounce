const presets = [
    [
	"@babel/env",
	{
	    targets: {
		edge: "17",
		firefox: "60",
		chrome: "58",
		safari: "10",
		ie: "10"
	    },
	    useBuiltIns: "entry",
	},
    ],
];

module.exports = { presets };
