'use client';

export function TestWidgetButton() {
    return (
        <button 
            onClick={() => {
                setTimeout(() => {
                    const widget = document.createElement('div');
                    widget.setAttribute('data-widget', 'wait-time');
                    widget.setAttribute('data-use-default-styles', 'false');
                    widget.setAttribute('data-token', 'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiYzM4MDdjZjUtMDVlOC00YjRkLTk2YzktZGM4ZTc4YTUwNWY0IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiNiIsIldpZGdldC1JZCI6IjQ1ZjcyZDFkLTBjNDctNDdmMS1hYmM0LWMyYjNhNmU5YTUxOCIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.nmtIoFPZCYF56WZRUIGv9rv0KvvpppkMr-vx87w397A');
                    
                    const section = document.querySelector('.flex.flex-col.items-start.gap-3.sm\\:gap-4');
                    if (section) {
                        section.appendChild(widget);
                    } else {
                        console.error('Section not found');
                    }
                }, 2000);
            }}
            className="btn btn-lg btn-secondary sm:btn-wide"
        >
            Add Widget After 2s
        </button>
    );
}