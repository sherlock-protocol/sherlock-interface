sass:
	@echo Rendering styles /src/styles to /static/css🤙
	sass src/scss/:static/css/
	@echo Rendered all css

sass-watch:
	@echo Started watching styles
	sass --watch src/scss/:static/css/

app:
	git rev-parse HEAD > .hash
