function mergeSort(arr) {
  if (arr.length <= 1) {
      return arr;
  }// If the array has 1 or fewer elements, return the array as it is already sorted

  const mid = Math.floor(arr.length / 2);
  // Calculate the middle index of the array
  const left = arr.slice(0, mid);
  // Split the array into two halves, left and right
  const right = arr.slice(mid);
  // Split the array into two halves, left and right
  return merge(mergeSort(left), mergeSort(right));
  // Recursively call mergeSort on the left and right halves, then merge the sorted halves
}

function merge(left, right) {
  let result = [];
  // Create an empty array to store the merged result
  let i = 0;
  let j = 0;
  // Initialize two pointers, i and j, for the left and right arrays respectively
  while (i < left.length && j < right.length) {
      // Compare the elements at the current positions of the left and right arrays
      if (left[i].date < right[j].date) {
          result.push(left[i]);
          // If the element in the left array is smaller, push it to the result array
          i++;
          // Move the pointer of the left array to the next element
      } else {
          result.push(right[j]);
          // If the element in the right array is smaller, push it to the result array
          j++;
          // Move the pointer of the right array to the next element
      }
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
  // Concatenate the remaining elements of the left and right arrays to the result array
}

module.exports = {
  mergeSort,
  merge
};
