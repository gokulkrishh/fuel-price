
// ABC Sorting
export function sort(result, sortBy) {
  if (result && result.length > 0 && sortBy) {
    var sortedArray = result.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    return sortedArray;
  }
}

export function formateDate(updatedDate) {
  const date = new Date(updatedDate);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  var datePlaceholder = "";
  if (new Date().getDate() === day) {
    datePlaceholder = "Today, ";
  }
  else if ((new Date().getDate() - 1) === day) {
    datePlaceholder = "Yesterday, ";
  }
  return `${datePlaceholder} ${day} ${month} ${year}`;
}

export function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}
