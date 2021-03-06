const form = document.getElementById('vote-form');
var event;

form.addEventListener('submit', e=>{

    const choice = document.querySelector('input[name=os]:checked').value;
    const data = {os: choice};

    fetch('http://localhost:3000/poll',{
        method: 'post',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then(res => res.json())
    .catch(err => console.log(err));

    e.preventDefault();
});

fetch("http://localhost:3000/poll")
    .then(res => res.json())
    .then(data => {
        const votes = data.votes;
        const totalVotes = votes.length;
        document.querySelector('#chartTitle').textContent = `Total Votes: ${totalVotes}`;

        let voteCounts = {
            Useful: 0,
            Normal: 0,
            Useless: 0,
            Worst: 0
        };

         voteCounts = votes.reduce((acc, vote) => (
            (acc[vote.os] = (acc[vote.os] || 0) + parseInt(vote.points)), acc),
            {}
        );

        let dataPoints = [
            { label: 'Useful', y: voteCounts.Useful },
            { label: 'Normal', y: voteCounts.Normal },
            { label: 'Useless', y: voteCounts.Useless },
            { label: 'Worst', y: voteCounts.Worst }
        ];

        const chartContainer = document.querySelector('#chartContainer');

        if(chartContainer){

            // Listen for the event.
            document.addEventListener('votesAdded', function (e) {
                document.querySelector('#chartTitle').textContent = `Total Votes: ${e.detail.totalVotes}`;
            });

            const chart = new CanvasJS.Chart('chartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                data:[
                    {
                        type: 'column',
                        dataPoints: dataPoints
                    }
                ]
            });
            chart.render();

             // Enable pusher logging - don't include this in production
             Pusher.logToConsole = true;

             var pusher = new Pusher('355bbcc1238451dd1d93', {
               cluster: 'ap2',
               encrypted: true
             });

             var channel = pusher.subscribe('os-poll');

             channel.bind('os-vote', function(data) {
               dataPoints.forEach((point)=>{
                   if(point.label==data.os)
                   {
                        point.y+=data.points;
                        totalVotes+=data.points;
                        event = new CustomEvent('votesAdded',{detail:{totalVotes:totalVotes}});
                        // Dispatch the event.
                        document.dispatchEvent(event);
                   }
               });
               chart.render();
             });
        }

});
