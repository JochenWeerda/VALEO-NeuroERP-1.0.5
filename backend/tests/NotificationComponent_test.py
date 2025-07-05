
            class ExampleComponent {
                constructor(props) {
                    this.state = {
                        data: props.initialData || []
                    };
                }
                
                getData() {
                    return this.state.data;
                }
                
                setData(newData) {
                    this.state.data = newData;
                    return this;
                }
                
                render() {
                    return `<div class="example-component">
                        <h2>Example Component</h2>
                        <ul>
                            ${this.state.data.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>`;
                }
            }
            