console.log('Testing require express...');
try {
    const express = require('express');
    console.log('Express loaded successfully');
} catch (e) {
    console.error('Failed to load express:', e);
}
